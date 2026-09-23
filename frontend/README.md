# UniShare giao diện

Giao diện Next.js cho UniShare. Chạy các lệnh trong thư mục `frontend` sau khi backend và MongoDB đã hoạt động.

Sao chép `.env.example` thành `.env.local`; điều chỉnh `NEXT_PUBLIC_API_URL` nếu backend không ở `http://localhost:8000/api`.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Để kiểm tra trước khi triển khai, chạy `npm run lint` và `npm run build`. Tài khoản quản trị đầu tiên được tạo ở backend bằng `npm run seed:admin` sau khi đặt `ADMIN_PASSWORD` an toàn.

Giao diện hỗ trợ tìm kiếm/lọc tài liệu, tải nhiều tài liệu với trạng thái từng tệp, trang hồ sơ, báo cáo tài liệu và quản trị có phân trang. Nếu quên mật khẩu, hãy liên hệ quản trị viên; ứng dụng chưa có khôi phục qua email.
