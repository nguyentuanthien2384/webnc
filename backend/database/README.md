# Database UniShare — dump & import

Bộ dữ liệu demo đầy đủ để chạy dự án. Thư mục `dump/` chứa một file JSON cho mỗi
collection, ở định dạng **Canonical Extended JSON** của MongoDB — kiểu `ObjectId`
và `Date` được giữ nguyên, nên quan hệ khoá ngoại giữa các collection không bị vỡ
sau khi import.

## Thiết lập an toàn trên máy mới

Đặt `DATABASE_URL=mongodb://127.0.0.1:27017/unishare` trong `backend/.env`, rồi chạy
các lệnh sau trong thư mục `backend` khi database còn trống:

```bash
npm install
npm run db:import
npm run db:restore-files
npm run db:sync-demo-file-sizes -- --apply
npm run db:seed-demo-extras
npm run db:verify
```

Nếu database đã có dữ liệu, bỏ qua `db:import`. Script này dừng trước khi ghi nếu
bất kỳ collection trong dump đã có bản ghi. `db:restore-files` chỉ tạo file PDF mẫu
và thumbnail còn thiếu; `db:sync-demo-file-sizes` chỉ sửa kích thước của các PDF
mẫu khi có `--apply`. `db:seed-demo-extras` chỉ bổ sung một báo cáo đang chờ xử lý
và một bản nháp để thử các chức năng mới, chạy lại không tạo bản sao.

`db:verify` chỉ đọc dữ liệu và kiểm tra tài khoản mẫu, quan hệ, PDF, thumbnail và
kích thước file. Bộ `dump/` gồm 84 bản ghi thuộc sáu collection; báo cáo và bản
nháp mẫu được tạo riêng bởi `db:seed-demo-extras`.

## Nội dung

| Collection      | Số bản ghi | Ghi chú                                              |
|-----------------|-----------:|------------------------------------------------------|
| `users`         |          7 | 1 admin, 1 moderator, 5 sinh viên                     |
| `subjects`      |         18 | Môn học                                               |
| `majors`        |          3 | Ngành học, mỗi ngành trỏ tới danh sách môn            |
| `documents`     |         10 | Tài liệu PDF, đã có `thumbnailUrl`                    |
| `logs`          |         45 | Lịch sử hoạt động, 13 loại hành động                  |
| `platformstats` |          1 | Thống kê tổng của hệ thống                            |

**Tài khoản đăng nhập**

| Vai trò    | Email                          | Mật khẩu   |
|------------|--------------------------------|------------|
| Admin      | `admin@unishare.com`           | `admin123` |
| Moderator  | `mod@st.phenikaa-uni.edu.vn`   | `123456`   |
| Sinh viên  | `huy@st.phenikaa-uni.edu.vn`   | `123456`   |

Các sinh viên còn lại: `minh`, `quang`, `tien`, `linh` — cùng đuôi email và mật khẩu `123456`.

## Cách import

Chọn **một** trong bốn cách dưới đây. Cả bốn đều cho kết quả giống nhau.

### Cách 0 — một file duy nhất, không cần thư mục `dump/`

`unishare-full-db.js` chứa sẵn toàn bộ 84 document. Chỉ cần đúng file này.

```bash
cd backend
node database/unishare-full-db.js
```

Hoặc mở **MongoDB Compass** → cửa sổ `>_ MONGOSH` ở đáy màn hình:

```js
load("D:/webnc/backend/database/unishare-full-db.js")
```

Khác với `db:import`, file này **luôn xoá sạch rồi nạp lại** — không hỏi gì thêm.

### Cách 1 — script Node (khuyến nghị)

Không cần cài thêm gì ngoài `npm install` đã chạy sẵn.

```bash
cd backend
npm run db:import            # nạp vào DATABASE_URL trong .env
npm run db:import -- --drop  # xoá sạch dữ liệu cũ rồi nạp lại
```

Không có `--drop`, script sẽ **dừng lại** nếu collection đích đã có dữ liệu, để
tránh ghi đè nhầm. Muốn nạp vào database khác thì truyền URI:

```bash
node database/import-db.js "mongodb://127.0.0.1:27017/ten_db_khac"
```

### Cách 2 — MongoDB Compass

1. Tạo database `unishare`.
2. Tạo từng collection theo đúng tên file trong `dump/` (`users`, `subjects`, …).
3. Với mỗi collection: **Add Data → Import JSON file** → chọn file tương ứng.

Giữ nguyên tên collection, nếu không các tham chiếu khoá ngoại sẽ không khớp.

### Cách 3 — mongoimport

Cần cài [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)
(không đi kèm MongoDB Server).

```bash
cd backend/database/dump
for f in *.json; do
  mongoimport --uri "mongodb://127.0.0.1:27017/unishare" \
              --collection "${f%.json}" --file "$f" --jsonArray --drop
done
```

## Sau khi import: khôi phục file trong `uploads/`

Thư mục `backend/uploads/` nằm trong `.gitignore` nên **không đi kèm repo**. Nếu
bạn import dump trên một máy khác mà thiếu thư mục này, tài liệu vẫn hiện ra
nhưng xem trước và tải về sẽ lỗi 404.

```bash
cd backend
npm run db:restore-files
```

Script đọc `documents` trong DB, sinh lại các file PDF mẫu còn thiếu và ảnh
thumbnail tương ứng. File đã có sẵn thì không bị đụng tới.

Nếu PDF mẫu được tạo lại, đồng bộ `fileSize` trong database với kích thước thực:

```bash
npm run db:sync-demo-file-sizes              # xem trước, không ghi
npm run db:sync-demo-file-sizes -- --apply   # cập nhật metadata PDF mẫu
```

## Xuất lại dump

Sau khi thay đổi dữ liệu và muốn cập nhật lại bộ dump:

```bash
cd backend
npm run db:export
```

Ghi đè toàn bộ file trong `dump/` bằng dữ liệu hiện tại của DB.

## Kiểm tra sau khi import

```bash
cd backend
npm run start:dev
```

Đăng nhập bằng tài khoản admin rồi vào trang **Quản trị → Lịch sử hoạt động** để
xem 45 log. Trang danh sách tài liệu phải hiện đủ 10 tài liệu kèm ảnh thumbnail.
