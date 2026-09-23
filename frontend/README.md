# UniShare giao diện

Giao diện Next.js cho UniShare. Khi sử dụng ứng dụng, cần chạy backend và MongoDB; riêng kiểm thử giao diện tự động dùng API giả lập.

Sao chép `.env.example` thành `.env.local`; điều chỉnh `NEXT_PUBLIC_API_URL` nếu backend không ở `http://localhost:8000/api`.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Để kiểm tra trước khi triển khai, chạy `npm run lint` và `npm run build`. Kiểm thử giao diện tự động chạy độc lập với backend (API được giả lập): cài Chromium một lần bằng `npx playwright install chromium`, rồi chạy `npm run test:e2e`. Tài khoản quản trị đầu tiên được tạo ở backend bằng `npm run seed:admin` sau khi đặt `ADMIN_PASSWORD` an toàn.

Giao diện hỗ trợ tìm kiếm/lọc tài liệu, tải nhiều tài liệu với trạng thái từng tệp, trang hồ sơ, báo cáo tài liệu và quản trị có phân trang. Người dùng có thể yêu cầu email khôi phục mật khẩu; backend phải được cấu hình SMTP trước khi dùng luồng này. Trình soạn thảo lưu bản nháp riêng vào tài khoản và có thể gắn ghi chú với một tài liệu, bên cạnh sao lưu cục bộ/xuất JSON. Nếu bản nháp đã thay đổi ở nơi khác, người dùng có thể giữ nội dung hiện tại bằng cách lưu thành bản sao.
