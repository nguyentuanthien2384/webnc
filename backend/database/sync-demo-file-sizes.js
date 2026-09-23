/**
 * Sync fileSize for existing demo PDFs only. Defaults to a read-only preview.
 *
 *   node database/sync-demo-file-sizes.js [mongodb-uri]
 *   node database/sync-demo-file-sizes.js --apply [mongodb-uri]
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const uri = args.find((arg) => !arg.startsWith('--')) || process.env.DATABASE_URL;
const root = path.resolve(__dirname, '..');
const uploadsRoot = path.join(root, 'uploads');

function demoPdfPath(stored) {
  if (typeof stored !== 'string') return null;
  const normalized = stored.replace(/\\/g, '/');
  if (!/^uploads\/seed-[a-zA-Z0-9-]+\.pdf$/.test(normalized)) return null;
  const target = path.join(root, normalized);
  if (!fs.existsSync(target)) return null;
  const relative = path.relative(fs.realpathSync(uploadsRoot), fs.realpathSync(target));
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return null;
  return target;
}

function validPdf(filePath) {
  const size = fs.statSync(filePath).size;
  const fd = fs.openSync(filePath, 'r');
  try {
    const head = Buffer.alloc(5);
    const tail = Buffer.alloc(Math.min(size, 1024));
    fs.readSync(fd, head, 0, head.length, 0);
    fs.readSync(fd, tail, 0, tail.length, Math.max(0, size - tail.length));
    return head.toString('ascii') === '%PDF-' && tail.toString('ascii').includes('%%EOF');
  } finally {
    fs.closeSync(fd);
  }
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
    const collection = client.db().collection('documents');
    const docs = await collection.find({
      fileType: 'application/pdf',
      filePath: /^uploads[/\\]seed-[a-zA-Z0-9-]+\.pdf$/,
    }, { projection: { filePath: 1, fileSize: 1 } }).toArray();

    let mismatches = 0;
    let updated = 0;
    for (const doc of docs) {
      const filePath = demoPdfPath(doc.filePath);
      if (!filePath || !validPdf(filePath)) {
        console.warn(`Bỏ qua ${String(doc._id)}: file mẫu thiếu hoặc không hợp lệ.`);
        continue;
      }
      const actualSize = fs.statSync(filePath).size;
      if (doc.fileSize === actualSize) continue;
      mismatches++;
      console.log(`${String(doc._id)}: ${String(doc.fileSize)} -> ${actualSize} bytes`);
      if (apply) {
        const result = await collection.updateOne(
          { _id: doc._id, filePath: doc.filePath, fileSize: doc.fileSize },
          { $set: { fileSize: actualSize } },
        );
        updated += result.modifiedCount;
      }
    }
    console.log(apply
      ? `Đã cập nhật ${updated}/${mismatches} tài liệu mẫu.`
      : `Có ${mismatches} tài liệu mẫu cần cập nhật; thêm --apply để thực hiện.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
