/**
 * Nạp dữ liệu từ database/dump/*.json vào MongoDB.
 * Chạy được ngay bằng Node, không cần cài MongoDB Database Tools.
 *
 *   node database/import-db.js                 # nạp vào DATABASE_URL trong .env
 *   node database/import-db.js <uri>           # hoặc chỉ định URI trực tiếp
 *   node database/import-db.js --drop          # xoá sạch collection cũ trước khi nạp
 *
 * Mặc định script DỪNG nếu collection đích đã có dữ liệu, để tránh ghi đè nhầm.
 * Dùng --drop khi bạn thực sự muốn thay thế toàn bộ.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { EJSON } = require('bson');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const args = process.argv.slice(2);
const drop = args.includes('--drop');
const uri = args.find((a) => !a.startsWith('--')) || process.env.DATABASE_URL;
const dumpDir = path.join(__dirname, 'dump');

async function main() {
  if (!uri) {
    console.error('Thiếu DATABASE_URL trong .env hoặc tham số URI.');
    process.exit(1);
  }
  if (!fs.existsSync(dumpDir)) {
    console.error(`Không tìm thấy thư mục ${dumpDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dumpDir).filter((f) => f.endsWith('.json')).sort();
  if (files.length === 0) {
    console.error('Thư mục dump rỗng.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  console.log(`Đã kết nối: ${db.databaseName}\n`);

  // Kiểm tra trước toàn bộ, chưa ghi gì cả.
  if (!drop) {
    const nonEmpty = [];
    for (const file of files) {
      const name = path.basename(file, '.json');
      const have = await db.collection(name).countDocuments();
      if (have > 0) {
        const want = EJSON.parse(fs.readFileSync(path.join(dumpDir, file), 'utf8')).length;
        nonEmpty.push({ name, have, want });
      }
    }
    if (nonEmpty.length) {
      console.log('ĐÃ DỪNG — không có gì bị thay đổi.\n');
      console.log('Database này đã có sẵn dữ liệu:\n');
      for (const { name, have, want } of nonEmpty) {
        console.log(`  ${name.padEnd(16)} đang có ${String(have).padStart(4)}  |  trong dump ${String(want).padStart(4)}`);
      }
      console.log('\nĐây không phải lỗi. Script không ghi đè để tránh mất dữ liệu.');
      console.log('  - Nếu số lượng đã khớp với dump: không cần làm gì, chạy dự án được luôn.');
      console.log('  - Nếu muốn xoá sạch và nạp lại từ dump: npm run db:import -- --drop');
      await client.close();
      return;
    }
  }

  let total = 0;
  for (const file of files) {
    const name = path.basename(file, '.json');
    const docs = EJSON.parse(fs.readFileSync(path.join(dumpDir, file), 'utf8'));

    if (drop) await db.collection(name).deleteMany({});
    if (docs.length) await db.collection(name).insertMany(docs);

    console.log(`  ${name.padEnd(16)} ${String(docs.length).padStart(4)} docs`);
    total += docs.length;
  }

  console.log(`\nXong: ${files.length} collection, ${total} document.`);
  console.log('Tài khoản admin: admin@unishare.com / admin123');
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
