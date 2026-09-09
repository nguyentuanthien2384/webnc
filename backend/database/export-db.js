/**
 * Xuất toàn bộ database ra file JSON (Extended JSON chuẩn của MongoDB).
 *
 *   node database/export-db.js            # xuất từ DATABASE_URL trong .env
 *   node database/export-db.js <uri>      # hoặc chỉ định URI trực tiếp
 *
 * Mỗi collection thành một file trong database/dump/. Định dạng Extended JSON
 * giữ nguyên kiểu ObjectId và Date, nên import lại không bị mất quan hệ khoá ngoại.
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { EJSON } = require('bson');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.argv[2] || process.env.DATABASE_URL;
const dumpDir = path.join(__dirname, 'dump');
const singleFile = path.join(__dirname, 'unishare-full-db.js');

const { ObjectId } = require('mongodb');

// Chuyển một giá trị BSON thành mã JS chạy được ở cả Node lẫn mongosh.
function lit(v, indent) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);

  if (v === null || v === undefined) return 'null';
  if (v instanceof ObjectId) return `OID(${JSON.stringify(v.toHexString())})`;
  if (v instanceof Date) return `DT(${JSON.stringify(v.toISOString())})`;
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    return `[\n${v.map((x) => padIn + lit(x, indent + 1)).join(',\n')}\n${pad}]`;
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.length === 0) return '{}';
    return `{\n${keys
      .map((k) => `${padIn}${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${lit(v[k], indent + 1)}`)
      .join(',\n')}\n${pad}}`;
  }
  return JSON.stringify(v);
}

function buildSingleFile(dbName, byCollection, total) {
  const names = Object.keys(byCollection).sort();
  const parts = names.map(
    (name) =>
      `    ${name}: [\n${byCollection[name].map((d) => '      ' + lit(d, 3)).join(',\n')}\n    ]`,
  );

  return `/**
 * UniShare — TOÀN BỘ DATABASE TRONG MỘT FILE
 *
 * ${names.length} collection, ${total} document. Không cần thư mục dump/, không cần
 * MongoDB Database Tools (mongoimport/mongorestore).
 *
 * CÁCH 1 — bằng Node (khuyến nghị, chắc chắn chạy được):
 *     cd backend
 *     node database/unishare-full-db.js
 *     node database/unishare-full-db.js "mongodb://127.0.0.1:27017/ten_db_khac"
 *
 * CÁCH 2 — bằng mongosh, hoặc cửa sổ MONGOSH ở đáy MongoDB Compass:
 *     load("D:/webnc/backend/database/unishare-full-db.js")
 *
 * File LUÔN xoá sạch ${names.length} collection này rồi nạp lại từ đầu.
 *
 * Đăng nhập: admin@unishare.com / admin123
 *
 * SINH TỰ ĐỘNG bởi database/export-db.js — đừng sửa tay, hãy chạy: npm run db:export
 */
/* eslint-disable */

(function () {
  var inShell =
    typeof db !== 'undefined' && db && typeof db.getSiblingDB === 'function';

  var OID, DT;
  if (inShell) {
    OID = function (s) { return new ObjectId(s); };
    DT = function (s) { return new Date(s); };
  } else {
    OID = function (s) { return new (require('mongodb').ObjectId)(s); };
    DT = function (s) { return new Date(s); };
  }

  var DATA = {
${parts.join(',\n')}
  };

  var names = Object.keys(DATA);

  if (inShell) {
    // ----- mongosh / Compass -----
    var target = db.getSiblingDB(${JSON.stringify(dbName)});
    print('Nap vao database: ' + ${JSON.stringify(dbName)});
    var n = 0;
    names.forEach(function (name) {
      target.getCollection(name).deleteMany({});
      if (DATA[name].length) target.getCollection(name).insertMany(DATA[name]);
      print('  ' + name + ': ' + DATA[name].length + ' docs');
      n += DATA[name].length;
    });
    print('Xong: ' + names.length + ' collection, ' + n + ' document.');
    print('Dang nhap: admin@unishare.com / admin123');
  } else {
    // ----- Node -----
    var nodePath = require('path');
    try {
      require('dotenv').config({ path: nodePath.join(__dirname, '..', '.env') });
    } catch (e) { /* không có dotenv cũng không sao */ }

    var uri =
      process.argv[2] ||
      process.env.DATABASE_URL ||
      'mongodb://127.0.0.1:27017/${dbName}';

    var MongoClient = require('mongodb').MongoClient;

    (async function () {
      var client = new MongoClient(uri);
      await client.connect();
      var target = client.db();
      console.log('Nạp vào database: ' + target.databaseName + '\\n');

      var n = 0;
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        await target.collection(name).deleteMany({});
        if (DATA[name].length) await target.collection(name).insertMany(DATA[name]);
        console.log('  ' + name.padEnd(16) + String(DATA[name].length).padStart(4) + ' docs');
        n += DATA[name].length;
      }

      console.log('\\nXong: ' + names.length + ' collection, ' + n + ' document.');
      console.log('Đăng nhập: admin@unishare.com / admin123');
      console.log('\\nNếu thiếu file trong uploads/, chạy tiếp: npm run db:restore-files');
      await client.close();
    })().catch(function (err) {
      console.error(err);
      process.exit(1);
    });
  }
})();
`;
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

  fs.mkdirSync(dumpDir, { recursive: true });

  const collections = (await db.listCollections().toArray())
    .map((c) => c.name)
    .sort();

  let total = 0;
  const byCollection = {};
  for (const name of collections) {
    const docs = await db.collection(name).find({}).toArray();
    const file = path.join(dumpDir, `${name}.json`);
    fs.writeFileSync(file, EJSON.stringify(docs, null, 2, { relaxed: false }));
    console.log(`  ${name.padEnd(16)} ${String(docs.length).padStart(4)} docs -> database/dump/${name}.json`);
    byCollection[name] = docs;
    total += docs.length;
  }

  // Gói tất cả vào một file duy nhất, để import không cần thư mục dump/
  fs.writeFileSync(singleFile, buildSingleFile(db.databaseName, byCollection, total));
  const kb = (fs.statSync(singleFile).size / 1024).toFixed(1);
  console.log(`\n  gói 1 file       ${String(total).padStart(4)} docs -> database/unishare-full-db.js (${kb} KB)`);

  console.log(`\nXong: ${collections.length} collection, ${total} document.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
