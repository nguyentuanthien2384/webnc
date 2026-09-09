/**
 * Khôi phục các file trong uploads/ mà DB đang tham chiếu nhưng thiếu trên đĩa.
 *
 *   node database/restore-files.js
 *
 * Dùng khi bạn import dump vào một máy khác: uploads/ nằm trong .gitignore nên
 * không đi kèm repo, khiến mọi lượt xem trước / tải tài liệu bị 404. Script đọc
 * documents trong DB, sinh lại file PDF mẫu bị thiếu và ảnh thumbnail tương ứng.
 *
 * Chỉ tạo file còn thiếu, không đụng tới file đã có.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.argv[2] || process.env.DATABASE_URL;
const root = path.join(__dirname, '..');

// PDF tối giản, cùng khuôn với src/seed-database.ts
function samplePdf(title) {
  return [
    '%PDF-1.4',
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
    '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
    `4 0 obj<</Length 44>>stream\nBT /F1 16 Tf 72 720 Td (${title}) Tj ET\nendstream\nendobj`,
    'xref\n0 6',
    'trailer<</Size 6/Root 1 0 R>>',
    '%%EOF',
  ].join('\n');
}

async function main() {
  if (!uri) {
    console.error('Thiếu DATABASE_URL trong .env hoặc tham số URI.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  console.log(`Đã kết nối: ${db.databaseName}\n`);

  const docs = await db.collection('documents').find({}).toArray();
  fs.mkdirSync(path.join(root, 'uploads', 'thumbnails'), { recursive: true });

  let pdfMade = 0;
  const needThumb = [];

  for (const doc of docs) {
    if (!doc.filePath) continue;
    const abs = path.join(root, doc.filePath);

    if (!fs.existsSync(abs)) {
      fs.writeFileSync(abs, samplePdf(doc.title));
      console.log(`  [PDF ] tạo lại ${doc.filePath}`);
      pdfMade++;
    }

    if (doc.thumbnailUrl && doc.fileType === 'application/pdf') {
      const png = path.basename(doc.filePath).replace(/\.[^.]+$/, '') + '.png';
      if (!fs.existsSync(path.join(root, 'uploads', 'thumbnails', png))) {
        needThumb.push({ doc, abs, png });
      }
    }
  }

  if (needThumb.length) {
    const { pdfToPng } = await import('pdf-to-png-converter');
    // pdfToPng nối outputFolder với process.cwd(), nên phải truyền đường dẫn
    // tương đối theo cwd — đường dẫn tuyệt đối sẽ bị ghép thành D:\...\D:\...
    const outDir = path.relative(process.cwd(), path.join(root, 'uploads', 'thumbnails'));
    for (const { doc, abs, png } of needThumb) {
      try {
        await pdfToPng(abs, {
          viewportScale: 1.5,
          pagesToProcess: [1],
          outputFolder: outDir,
          outputFileMaskFunc: () => png,
        });
        console.log(`  [THUMB] tạo lại ${png}`);
      } catch (err) {
        console.log(`  [LỖI ] "${doc.title}": ${err.message}`);
      }
    }
  }

  if (pdfMade === 0 && needThumb.length === 0) {
    console.log('Không thiếu file nào — uploads/ đã đầy đủ.');
  } else {
    console.log(`\nXong: ${pdfMade} PDF, ${needThumb.length} thumbnail.`);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
