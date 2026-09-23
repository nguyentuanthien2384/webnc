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
- Quản trị người dùng, tài liệu, môn/ngành học; thống kê và nhật ký hoạt động.

Tệp tài liệu không được phục vụ trực tiếp qua `/uploads`. Truy cập qua các endpoint `/api/documents/:id/preview`, `/download` và `/thumbnail` để kiểm tra trạng thái tài liệu và quyền truy cập. Nếu đang dùng dữ liệu cũ với URL thumbnail dạng `/uploads/thumbnails/...`, chạy `npm run generate:thumbnails` một lần sau khi sao lưu dữ liệu để chuyển sang URL mới và tạo các ảnh còn thiếu.

`POST /api/auth/forgot-password` không tự đặt lại mật khẩu: hiện chưa tích hợp email xác minh nên người dùng cần liên hệ quản trị viên. Endpoint trả cùng một thông báo cho email có hoặc không có tài khoản. Quản trị viên có thể dùng chức năng đặt lại mật khẩu trong trang quản trị.

## Kiểm tra

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

Kiểm thử e2e cần MongoDB và sử dụng cơ sở dữ liệu riêng có tên `unishare_e2e_*`; dữ liệu thử được dọn sau khi chạy. Không trỏ `DATABASE_URL` vào cơ sở dữ liệu sản xuất khi chạy kiểm thử.
