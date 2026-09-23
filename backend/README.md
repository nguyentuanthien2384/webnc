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
