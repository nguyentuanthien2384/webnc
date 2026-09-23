# UniShare giao diện

Giao diện Next.js cho UniShare. Khi sử dụng ứng dụng, cần chạy backend và MongoDB; riêng kiểm thử giao diện tự động dùng API giả lập.

Sao chép `.env.example` thành `.env.local`; điều chỉnh `NEXT_PUBLIC_API_URL` nếu backend không ở `http://localhost:8000/api`.

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Để kiểm tra trước khi triển khai, chạy `npm run lint` và `npm run build`. Kiểm thử giao diện tự động chạy độc lập với backend (API được giả lập): cài Chromium một lần bằng `npx playwright install chromium`, rồi chạy `npm run test:e2e`. Tài khoản quản trị đầu tiên được tạo ở backend bằng `npm run seed:admin` sau khi đặt `ADMIN_PASSWORD` an toàn.

Giao diện hỗ trợ tìm kiếm/lọc tài liệu, tải nhiều tài liệu với trạng thái từng tệp, trang hồ sơ, báo cáo tài liệu và quản trị có phân trang. Người dùng có thể yêu cầu email khôi phục mật khẩu; backend phải được cấu hình SMTP trước khi dùng luồng này. Trình soạn thảo lưu bản nháp riêng vào tài khoản và có thể gắn ghi chú với một tài liệu, bên cạnh sao lưu cục bộ/xuất JSON. Nếu bản nháp đã thay đổi ở nơi khác, người dùng có thể giữ nội dung hiện tại bằng cách lưu thành bản sao.

Trang chi tiết tài liệu hiển thị PDF trực tiếp bằng React-PDF với nút chuyển trang và phóng to/thu nhỏ; DOCX được hiển thị bằng `docx-preview`. Với tệp DOC cũ hoặc tệp không thể hiển thị, người dùng có thể mở tệp trong tab mới hoặc tải xuống.

Trang **Thống kê hệ thống** có thể xuất CSV hoặc tệp Excel `.xlsx`. Excel gồm sheet tổng quan và dữ liệu tải lên theo khoảng 7/30/90 ngày đang chọn. Trong phần quản trị người dùng và tài liệu, nút **Xuất Excel (trang hiện tại)** lấy đúng các hàng đang hiển thị sau khi tìm kiếm, lọc và phân trang; tệp không tự bao gồm các trang khác. ExcelJS chỉ được tải vào trình duyệt khi người dùng chọn xuất Excel.

**Dashboard** dành cho Admin/Moderator tổng hợp chỉ số nền tảng, xu hướng đăng tài liệu theo 7/30/90 ngày, số báo cáo chờ xử lý, tài liệu mới và tài liệu được tải nhiều. Nút **Làm mới** cập nhật các phần dữ liệu; mỗi phần hiển thị trạng thái tải, lỗi và cách thử lại riêng. Các lối tắt mở thẳng mục báo cáo hoặc tài liệu trong trang quản lý.
