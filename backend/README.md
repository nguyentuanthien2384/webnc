# UniShare API

API NestJS + MongoDB cho ứng dụng chia sẻ tài liệu học tập. Chạy các lệnh dưới đây trong thư mục `backend`.

## Thiết lập

Yêu cầu Node.js 20+, npm và MongoDB. Sao chép `.env.example` thành `.env`, rồi đặt `DATABASE_URL` và `JWT_SECRET` riêng cho môi trường của bạn. `API_URL` là địa chỉ công khai của backend; `FRONTEND_URL` là nguồn giao diện được phép truy cập API (có thể ghi nhiều URL, ngăn cách bằng dấu phẩy). Không đưa `.env` lên Git.

```bash
npm install
npm run start:dev
```

Mặc định API ở `http://localhost:8000/api`. Để tạo quản trị viên lần đầu, đặt `ADMIN_PASSWORD` mạnh, dài ít nhất 12 ký tự trong `.env`, rồi chạy `npm run seed:admin`. Script không thay đổi mật khẩu của tài khoản đã tồn tại; nếu từng dùng mật khẩu mẫu cũ, hãy đổi mật khẩu đó trước khi triển khai.

## Chức năng

- Đăng ký bằng email sinh viên Phenikaa, đăng nhập JWT, đăng xuất thu hồi token, đổi mật khẩu, sửa/xóa tài khoản.
- Tải lên, tìm kiếm, lọc và phân trang tài liệu; xem trước, tải xuống, chỉnh sửa và xóa tài liệu theo quyền sở hữu.
- Báo cáo tài liệu; quản trị viên/điều hành viên xem và xử lý báo cáo.
- Khôi phục mật khẩu qua email với liên kết dùng một lần, hết hạn sau 15 phút; bản nháp trình soạn thảo riêng tư có thể gắn với tài liệu.
- Quản trị người dùng, tài liệu, môn/ngành học; thống kê và nhật ký hoạt động.

## Phân quyền

Hệ thống có ba vai trò `USER`, `MODERATOR`, `ADMIN`. `GET /api/auth/me` và `POST /api/auth/login` trả `permissions: string[]` cho vai trò hiện tại; API đọc lại vai trò từ cơ sở dữ liệu mỗi lần xác thực nên thay đổi vai trò có hiệu lực ngay, kể cả với JWT đã cấp. Backend kiểm tra quyền theo tên chức năng ở từng API và trả HTTP 403 khi thiếu quyền. Giao diện có thể dùng danh sách này để hiện hoặc ẩn thao tác, nhưng quyết định cho phép vẫn thuộc backend.

- **USER:** `documents.upload`, `documents.update_own`, `documents.delete_own`, `documents.download`, `reports.create`, `drafts.manage_own`. Sửa/xóa tài liệu và quản lý bản nháp luôn kiểm tra chủ sở hữu.
- **MODERATOR:** toàn bộ quyền USER, thêm `dashboard.view` (dashboard hệ thống), `statistics.view`, `reports.review`, `users.list`, `users.moderate`, `documents.review`, `documents.moderate`. Chỉ được khóa/mở tài khoản USER khác; không được sửa vai trò, xóa tài khoản hoặc tài liệu, xem nhật ký hay sửa danh mục.
- **ADMIN:** toàn bộ quyền MODERATOR, thêm `users.reset_password`, `users.delete`, `users.assign_role`, `admin.delegate`, `documents.delete_any`, `audit.view`, `catalog.manage`, `documents.generate_thumbnails`. Admin không thể khóa, xóa, đổi vai trò hay reset mật khẩu chính tài khoản Admin. Tài khoản USER bị khóa phải được mở khóa trước khi thăng thành Moderator. Quyền Admin chỉ chuyển cho Moderator bằng chức năng ủy quyền; Admin cũ trở thành Moderator.

Dashboard cá nhân và `/api/users/me/stats` dùng được với mọi tài khoản đã đăng nhập. `dashboard.view` chỉ là quyền xem số liệu toàn hệ thống. `totalDownloads` ở thống kê cá nhân là lượt tải tích lũy, còn `totalUploads` và `avgDownloadsPerDoc` tính từ tài liệu hiện còn (kể cả tài liệu bị chặn). `/api/users/me/upload-stats` nhận `period=day|month|year|all|custom`; các ngày và ranh giới lọc theo `Asia/Ho_Chi_Minh`. Kỳ có giới hạn trả đủ ngày, kể cả ngày không có tài liệu. Kỳ `custom` cần `fromDate=YYYY-MM-DD`, có thể thêm `toDate`, tối đa 366 ngày.

`GET /api/statistics/uploads-over-time?days=7` dành cho Admin/Moderator trả về đúng số ngày yêu cầu dưới dạng `{ date: "YYYY-MM-DD", count: number }`, gồm cả hôm nay và những ngày không có lượt tải lên (`count: 0`). Ngày và ranh giới ngày tính theo múi giờ `Asia/Ho_Chi_Minh` (UTC+7); thời điểm lưu trong MongoDB vẫn là UTC. `days` mặc định là 30, nhận số nguyên từ 1 đến 365.

`GET /api/statistics/platform` giữ `totalDownloads` là tổng lượt tải tích lũy, kể cả lượt tải của tài liệu đã bị xóa. `totalUploads` là số tài liệu hiện còn; `avgDlPerDoc` là trung bình `downloadCount` của các tài liệu hiện còn (gồm tài liệu bị chặn), làm tròn hai chữ số. Vì hai chỉ số lượt tải có phạm vi khác nhau, không tính `avgDlPerDoc` bằng `totalDownloads / totalUploads`.

Tệp tài liệu không được phục vụ trực tiếp qua `/uploads`. Truy cập qua các endpoint `/api/documents/:id/preview`, `/download` và `/thumbnail` để kiểm tra trạng thái tài liệu và quyền truy cập. Nếu đang dùng dữ liệu cũ với URL thumbnail dạng `/uploads/thumbnails/...`, chạy `npm run generate:thumbnails` một lần sau khi sao lưu dữ liệu để chuyển sang URL mới và tạo các ảnh còn thiếu.

Khi tải tài liệu lên, API giới hạn 100 MB mỗi tệp và đối chiếu phần mở rộng, MIME cùng dấu hiệu định dạng trong nội dung tệp trước khi lưu bản ghi. PDF và DOCX được nhận diện bằng `file-type`; tệp DOC cũ được kiểm tra dấu hiệu CFBF. Tệp không hợp lệ bị từ chối và tệp tạm được dọn khỏi ổ đĩa.

## Gửi email khôi phục mật khẩu

Đặt `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM` và nếu máy chủ yêu cầu xác thực, đặt thêm `SMTP_USER` cùng `SMTP_PASSWORD` trong `backend/.env`. Cổng 465 dùng TLS trực tiếp; các cổng khác mặc định yêu cầu STARTTLS (`SMTP_REQUIRE_TLS=true`). `FRONTEND_URL` phải trỏ đến giao diện mà người dùng mở được. Không đặt thông tin SMTP vào `frontend/.env.local` và không commit mật khẩu.

Khi chưa cấu hình SMTP, `POST /api/auth/forgot-password` trả 503 và hướng dẫn liên hệ quản trị viên; hệ thống không tạo liên kết giả hoặc đổi mật khẩu. Khi đã cấu hình, endpoint luôn trả cùng một thông báo cho email có hoặc không có tài khoản, và giới hạn mỗi tài khoản một email/phút. Liên kết dẫn đến `/reset-password`; `POST /api/auth/reset-password` nhận token và mật khẩu mới. Sau khi đổi, mọi phiên JWT cũ hết hiệu lực. Kiểm thử e2e thay SMTP bằng hộp thư giả, nên không gửi email thật.

## Bản nháp trình soạn thảo

Người dùng đăng nhập có thể lưu bản nháp riêng qua `/api/editor/drafts`, mở lại, cập nhật và xóa; chỉ chủ sở hữu truy cập được. Từ trang chi tiết tài liệu, nút **Ghi chú riêng** tạo/mở một bản nháp gắn với tài liệu đó. Nội dung vẫn được sao lưu tạm trên trình duyệt, còn nút **Lưu vào tài khoản** ghi lên máy chủ. Bản nháp không được công khai như một tài liệu tải lên.

## Kiểm tra

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

Kiểm thử e2e cần MongoDB và sử dụng cơ sở dữ liệu riêng có tên `unishare_e2e_*`; dữ liệu thử được dọn sau khi chạy. Không trỏ `DATABASE_URL` vào cơ sở dữ liệu sản xuất khi chạy kiểm thử.
