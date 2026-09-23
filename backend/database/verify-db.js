/** Read-only check of demo accounts, references, documents, and local files. */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const { EJSON } = require('bson');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.argv[2] || process.env.DATABASE_URL;
const backendRoot = path.resolve(__dirname, '..');
const uploadsRoot = path.join(backendRoot, 'uploads');
const dumpDir = path.join(__dirname, 'dump');
const requiredCollections = ['users', 'subjects', 'majors', 'documents', 'platformstats', 'logs'];
const optionalCollections = ['reports', 'editor_drafts'];

function id(value) {
  return value == null ? null : String(value);
}

function localUploadPath(value) {
  if (!value || typeof value !== 'string') return null;
  let stored = value;
  if (/^https?:\/\//i.test(stored)) {
    try {
      stored = decodeURIComponent(new URL(stored).pathname);
    } catch {
      return null;
    }
  }
  stored = stored.replace(/\\/g, '/').replace(/^\//, '');
  if (!stored.startsWith('uploads/')) return null;
  const target = path.resolve(backendRoot, stored);
  const relative = path.relative(uploadsRoot, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return null;
  }
  return target;
}

function fileState(stored, requirePdf = false) {
  const target = localUploadPath(stored);
  if (!target || !fs.existsSync(target)) return { ok: false, reason: 'missing or unsafe path' };
  const actual = fs.realpathSync(target);
  const relative = path.relative(fs.realpathSync(uploadsRoot), actual);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    return { ok: false, reason: 'path points outside uploads' };
  }
  const size = fs.statSync(actual).size;
  if (requirePdf) {
    const fd = fs.openSync(actual, 'r');
    try {
      const head = Buffer.alloc(5);
      const tail = Buffer.alloc(Math.min(size, 1024));
      fs.readSync(fd, head, 0, head.length, 0);
      fs.readSync(fd, tail, 0, tail.length, Math.max(0, size - tail.length));
      if (head.toString('ascii') !== '%PDF-' || !tail.toString('ascii').includes('%%EOF')) {
        return { ok: false, reason: 'invalid PDF header/trailer' };
      }
    } finally {
      fs.closeSync(fd);
    }
  }
  return { ok: true, size };
}

async function main() {
  if (!uri) throw new Error('Thiếu DATABASE_URL trong .env hoặc tham số URI.');
  const parsed = new URL(uri);
  if (!parsed.pathname || parsed.pathname === '/') {
    throw new Error('DATABASE_URL phải chỉ rõ tên database.');
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    console.log(`Kiểm tra database: ${db.databaseName}`);
    const collectionNames = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name));
    const errors = [];
    const warnings = [];

    for (const name of [...requiredCollections, ...optionalCollections]) {
      const count = await db.collection(name).countDocuments();
      console.log(`  ${name.padEnd(16)} ${String(count).padStart(4)}`);
      if (requiredCollections.includes(name) && (!collectionNames.has(name) || count === 0)) {
        errors.push(`Collection ${name} chưa có dữ liệu.`);
      }
    }

    let baselineCount = 0;
    let baselinePresent = 0;
    let extraCount = 0;
    for (const name of requiredCollections) {
      const dumpPath = path.join(dumpDir, `${name}.json`);
      if (!fs.existsSync(dumpPath)) {
        errors.push(`Thiếu file dữ liệu gốc ${name}.json.`);
        continue;
      }
      const baseline = EJSON.parse(fs.readFileSync(dumpPath, 'utf8'));
      if (!Array.isArray(baseline)) {
        errors.push(`File ${name}.json không phải danh sách document.`);
        continue;
      }
      const baselineIds = new Set(baseline.map((record) => id(record._id)));
      const actualIds = new Set((await db.collection(name).find({}, { projection: { _id: 1 } }).toArray()).map((record) => id(record._id)));
      const missing = [...baselineIds].filter((recordId) => !actualIds.has(recordId));
      const extras = [...actualIds].filter((recordId) => !baselineIds.has(recordId));
      baselineCount += baselineIds.size;
      baselinePresent += baselineIds.size - missing.length;
      extraCount += extras.length;
      if (missing.length) errors.push(`${name}: thiếu ${missing.length} ID từ dump (${missing.join(', ')}).`);
      if (extras.length) console.log(`  ${name}: thêm ${extras.length} document ngoài dump.`);
    }
    console.log(`Dữ liệu gốc: ${baselinePresent}/${baselineCount} ID; dữ liệu thêm: ${extraCount}.`);

    const [users, subjects, majors, documents, reports, drafts, logs] = await Promise.all([
      db.collection('users').find({}, { projection: { email: 1, password: 1, role: 1, status: 1 } }).toArray(),
      db.collection('subjects').find({}, { projection: { _id: 1 } }).toArray(),
      db.collection('majors').find({}, { projection: { subjects: 1 } }).toArray(),
      db.collection('documents').find({}, { projection: { title: 1, uploader: 1, subject: 1, filePath: 1, fileUrl: 1, fileType: 1, fileSize: 1, thumbnailPath: 1, thumbnailUrl: 1 } }).toArray(),
      db.collection('reports').find({}, { projection: { document: 1, reporter: 1, resolvedBy: 1 } }).toArray(),
      db.collection('editor_drafts').find({}, { projection: { owner: 1, sourceDocument: 1 } }).toArray(),
      db.collection('logs').find({}, { projection: { performedBy: 1 } }).toArray(),
    ]);
    const userIds = new Set(users.map((user) => id(user._id)));
    const subjectIds = new Set(subjects.map((subject) => id(subject._id)));
    const documentIds = new Set(documents.map((doc) => id(doc._id)));

    for (const major of majors) {
      for (const subject of major.subjects || []) {
        if (!subjectIds.has(id(subject))) errors.push(`Ngành ${id(major._id)} tham chiếu môn học không tồn tại.`);
      }
    }
    let filesPresent = 0;
    let thumbsPresent = 0;
    let sizeMismatch = 0;
    for (const doc of documents) {
      if (!userIds.has(id(doc.uploader))) errors.push(`Tài liệu ${id(doc._id)} thiếu người đăng.`);
      if (!subjectIds.has(id(doc.subject))) errors.push(`Tài liệu ${id(doc._id)} thiếu môn học.`);
      const file = fileState(doc.filePath || doc.fileUrl, doc.fileType === 'application/pdf');
      if (!file.ok) errors.push(`Tài liệu ${id(doc._id)} thiếu file hoặc file lỗi (${file.reason}).`);
      else {
        filesPresent++;
        if (typeof doc.fileSize === 'number' && doc.fileSize !== file.size) sizeMismatch++;
      }
      if (doc.thumbnailPath || doc.thumbnailUrl) {
        const thumb = fileState(doc.thumbnailPath || doc.thumbnailUrl);
        if (!thumb.ok) errors.push(`Tài liệu ${id(doc._id)} thiếu thumbnail (${thumb.reason}).`);
        else thumbsPresent++;
      }
    }
    for (const report of reports) {
      if (!documentIds.has(id(report.document))) errors.push(`Báo cáo ${id(report._id)} thiếu tài liệu.`);
      if (!userIds.has(id(report.reporter))) errors.push(`Báo cáo ${id(report._id)} thiếu người gửi.`);
      if (report.resolvedBy && !userIds.has(id(report.resolvedBy))) errors.push(`Báo cáo ${id(report._id)} thiếu người xử lý.`);
    }
    for (const draft of drafts) {
      if (!userIds.has(id(draft.owner))) errors.push(`Bản nháp ${id(draft._id)} thiếu chủ sở hữu.`);
      if (draft.sourceDocument && !documentIds.has(id(draft.sourceDocument))) errors.push(`Bản nháp ${id(draft._id)} thiếu tài liệu gốc.`);
    }
    const historicalLogs = logs.filter((log) => log.performedBy && !userIds.has(id(log.performedBy))).length;
    if (historicalLogs) warnings.push(`${historicalLogs} log cũ tham chiếu người dùng đã xóa.`);
    if (sizeMismatch) warnings.push(`${sizeMismatch} tài liệu có fileSize lưu trong DB khác kích thước file hiện tại.`);
    console.log(`File: ${filesPresent}/${documents.length} tài liệu, ${thumbsPresent} thumbnail.`);

    const demos = [
      ['admin@unishare.com', 'admin123'],
      ['mod@st.phenikaa-uni.edu.vn', '123456'],
      ['huy@st.phenikaa-uni.edu.vn', '123456'],
    ];
    let validLogins = 0;
    for (const [email, password] of demos) {
      const user = users.find((item) => item.email === email);
      if (user?.status === 'ACTIVE' && typeof user.password === 'string' && await bcrypt.compare(password, user.password)) {
        validLogins++;
      } else {
        errors.push(`Tài khoản mẫu ${email} không đăng nhập được.`);
      }
    }
    console.log(`Tài khoản mẫu: ${validLogins}/${demos.length} hợp lệ.`);
    for (const warning of warnings) console.warn(`CẢNH BÁO: ${warning}`);
    for (const error of errors) console.error(`LỖI: ${error}`);
    console.log(errors.length ? `Kiểm tra thất bại: ${errors.length} lỗi.` : 'Kiểm tra thành công.');
    if (errors.length) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
