/** Add two optional demo records without replacing any existing data. */
const path = require('path');
const { MongoClient } = require('mongodb');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const uri = process.argv[2] || process.env.DATABASE_URL;

async function main() {
  if (!uri) throw new Error('Thiếu DATABASE_URL trong .env hoặc tham số URI.');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const [reporter, draftOwner, reportDocument, draftDocument] = await Promise.all([
      db.collection('users').findOne({ email: 'huy@st.phenikaa-uni.edu.vn', status: 'ACTIVE' }),
      db.collection('users').findOne({ email: 'minh@st.phenikaa-uni.edu.vn', status: 'ACTIVE' }),
      db.collection('documents').findOne({ title: 'Tổng hợp lý thuyết Cơ sở dữ liệu', status: 'VISIBLE' }),
      db.collection('documents').findOne({ title: 'Đề thi giữa kỳ Cấu trúc dữ liệu 2024', status: 'VISIBLE' }),
    ]);

    if (!reporter || !draftOwner || !reportDocument || !draftDocument) {
      throw new Error('Thiếu tài khoản hoặc tài liệu mẫu cần thiết; database chưa được nạp đủ.');
    }

    const now = new Date();
    const report = await db.collection('reports').updateOne(
      { document: reportDocument._id, reporter: reporter._id, status: 'OPEN' },
      {
        $setOnInsert: {
          document: reportDocument._id,
          reporter: reporter._id,
          reason: 'Báo cáo mẫu để kiểm thử quy trình xử lý tài liệu của quản trị viên.',
          status: 'OPEN',
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    const draft = await db.collection('editor_drafts').updateOne(
      { owner: draftOwner._id, sourceDocument: draftDocument._id },
      {
        $setOnInsert: {
          owner: draftOwner._id,
          sourceDocument: draftDocument._id,
          title: 'Ghi chú ôn tập Cấu trúc dữ liệu',
          content: {
            blocks: [
              { type: 'header', data: { text: 'Ôn tập Cấu trúc dữ liệu', level: 2 } },
              { type: 'paragraph', data: { text: 'Tóm tắt danh sách liên kết, ngăn xếp và hàng đợi.' } },
            ],
          },
          version: 0,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    console.log(`Báo cáo mẫu: ${report.upsertedCount ? 'đã thêm' : 'đã tồn tại'}.`);
    console.log(`Bản nháp mẫu: ${draft.upsertedCount ? 'đã thêm' : 'đã tồn tại'}.`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
