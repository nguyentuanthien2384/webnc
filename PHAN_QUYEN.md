# Phân quyền UniShare

UniShare có ba vai trò: **USER** (người dùng), **MODERATOR** (điều hành viên) và **ADMIN** (quản trị viên). MODERATOR có các quyền của USER; ADMIN có các quyền của MODERATOR. Quyền có hiệu lực lấy từ tài khoản hiện tại trong cơ sở dữ liệu mỗi khi kiểm tra JWT, không dựa vào vai trò ghi trong token cũ.

## USER

- Xem, tìm kiếm, xem trước tài liệu công khai và danh mục môn/ngành học.
- Đăng và tải tài liệu; xem dashboard cá nhân, hồ sơ và thống kê tài liệu của chính mình.
- Sửa hoặc xóa **tài liệu công khai do mình đăng**. Tài liệu đã bị chặn không thể tự sửa hoặc xóa.
- Tạo báo cáo đối với tài liệu công khai; quản lý bản nháp trình soạn thảo của chính mình.
- Cập nhật hồ sơ, đổi mật khẩu và tự xóa tài khoản theo luồng xác thực hiện có.

## MODERATOR

- Có mọi quyền của USER, thêm quyền xem dashboard và thống kê toàn nền tảng.
- Xem danh sách người dùng, tài liệu (kể cả tài liệu bị chặn) và báo cáo; xử lý báo cáo.
- Khóa hoặc mở khóa **tài khoản USER khác** và tài liệu. Không thể khóa chính mình, MODERATOR hoặc ADMIN.
- Không được sửa chức vụ, đặt lại mật khẩu, xóa tài khoản người khác, xóa tài liệu của người khác, quản lý danh mục hoặc xem nhật ký quản trị.

## ADMIN

- Có mọi quyền của MODERATOR, thêm quyền đặt lại mật khẩu cho tài khoản khác không phải ADMIN, xóa tài khoản người khác, xóa tài liệu bất kỳ và xem nhật ký quản trị.
- Gán vai trò USER/MODERATOR cho tài khoản khác; quản lý danh mục môn học và ngành học; kích hoạt việc tạo thumbnail còn thiếu.
- Chuyển giao chức vụ ADMIN cho một MODERATOR đang hoạt động. Sau khi chuyển giao, ADMIN cũ trở thành MODERATOR. Hệ thống chỉ cho phép một tài khoản ADMIN tại một thời điểm.
- ADMIN phải chuyển giao chức vụ trước khi tự xóa tài khoản.

## Cách quyền được áp dụng

- Backend kiểm tra quyền trên từng API và kiểm tra quyền sở hữu hoặc vai trò của đối tượng tại tầng nghiệp vụ. Thiếu quyền trả **403**; thiếu phiên hợp lệ trả **401**.
- `/api/auth/me` và phản hồi đăng nhập cung cấp danh sách `permissions` hiện hành để giao diện chỉ hiển thị chức năng tương ứng. Giao diện làm mới quyền khi mở trang và khi quay lại tab.
- Tài khoản bị khóa không thể dùng phiên đăng nhập cũ. Thay đổi vai trò có hiệu lực ngay ở API vì JWT được đối chiếu với tài khoản hiện tại.
- Dashboard USER chỉ tải dữ liệu của chính họ; dashboard MODERATOR/ADMIN mới tải số liệu toàn nền tảng và danh sách cần điều hành. Các thao tác chỉ dành cho ADMIN không xuất hiện với MODERATOR.

Danh sách mã quyền và vai trò chuẩn được định nghĩa tại `backend/src/auth/permissions.ts`. Quyền sở hữu tài liệu và bản nháp được kiểm tra thêm trong các service tương ứng.
