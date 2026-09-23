/**
 * Restore missing demo PDFs and thumbnails referenced by the database.
 * Existing files and non-demo uploads are never changed.
 *
 *   node database/restore-files.js [mongodb-uri]
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.argv[2] || process.env.DATABASE_URL;
const root = path.resolve(__dirname, '..');
const uploadsRoot = path.join(root, 'uploads');
const thumbnailDir = path.join(uploadsRoot, 'thumbnails');

function demoPdfPath(filePath) {
  if (typeof filePath !== 'string') return null;
  const normalized = filePath.replace(/\\/g, '/');
  if (!/^uploads\/seed-[a-zA-Z0-9-]+\.pdf$/.test(normalized)) return null;
  return path.join(root, normalized);
}

function toAscii(value) {
  return String(value || 'UniShare demo document')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

function samplePdf(title) {
  const safeTitle = toAscii(title).replace(/([\\()])/g, '\\$1');
  const stream = [
    'BT',
    '/F1 18 Tf',
    '72 720 Td',
    `(${safeTitle}) Tj`,
    '0 -32 Td',
    '/F1 12 Tf',
    '(Demo document - UniShare) Tj',
    'ET',
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
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
    const docs = await db.collection('documents').find({}, {
      projection: { title: 1, filePath: 1, fileType: 1, thumbnailUrl: 1, thumbnailPath: 1 },
    }).toArray();

    fs.mkdirSync(uploadsRoot, { recursive: true });
    const actualUploadsRoot = fs.realpathSync(uploadsRoot);
    const actualBackendRoot = fs.realpathSync(root);
    if (path.relative(actualBackendRoot, actualUploadsRoot) !== 'uploads') {
      throw new Error('Thư mục uploads không nằm trực tiếp trong backend.');
    }
    fs.mkdirSync(thumbnailDir, { recursive: true });
    // The converter resolves outputFolder from cwd, regardless of this script's location.
    process.chdir(root);
    const actualThumbnailDir = fs.realpathSync(thumbnailDir);
    if (actualThumbnailDir !== actualUploadsRoot &&
        !actualThumbnailDir.startsWith(actualUploadsRoot + path.sep)) {
      throw new Error('Thư mục thumbnails nằm ngoài uploads.');
    }

    let pdfMade = 0;
    let thumbMade = 0;
    let unresolved = 0;
    const needThumb = [];

    for (const doc of docs) {
      const filePath = demoPdfPath(doc.filePath);
      if (!filePath || doc.fileType !== 'application/pdf') {
        if (doc.filePath) {
          const candidate = path.resolve(root, doc.filePath);
          if (!fs.existsSync(candidate)) {
            console.warn(`  [THIẾU] Tài liệu không phải demo: ${String(doc._id)}`);
            unresolved++;
          }
        }
        continue;
      }

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, samplePdf(doc.title), { flag: 'wx' });
        console.log(`  [PDF ] ${path.relative(root, filePath)}`);
        pdfMade++;
      }

      if (doc.fileType === 'application/pdf' && (doc.thumbnailUrl || doc.thumbnailPath)) {
        const png = path.basename(filePath, '.pdf') + '.png';
        if (!fs.existsSync(path.join(thumbnailDir, png))) {
          needThumb.push({ filePath, png });
        }
      }
    }

    if (needThumb.length) {
      const { pdfToPng } = await import('pdf-to-png-converter');
      for (const { filePath, png } of needThumb) {
        try {
          const pages = await pdfToPng(filePath, {
            viewportScale: 1.5,
            pagesToProcess: [1],
            outputFolder: 'uploads/thumbnails',
            outputFileMaskFunc: () => png,
          });
          if (!pages.length || !fs.existsSync(path.join(thumbnailDir, png))) {
            throw new Error('Không tạo được ảnh trang đầu.');
          }
          console.log(`  [THUMB] ${png}`);
          thumbMade++;
        } catch (error) {
          console.warn(`  [LỖI] ${png}: ${error.message}`);
          unresolved++;
        }
      }
    }

    console.log(`Khôi phục: ${pdfMade} PDF mẫu, ${thumbMade} thumbnail; còn thiếu: ${unresolved}.`);
    if (unresolved) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
