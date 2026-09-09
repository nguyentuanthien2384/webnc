"use client";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { UserRole } from "@/@types/user.type";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  // Kiểm tra quyền (tránh lỗi crash nếu user đang null)
  const isAllowed = user ? allowedRoles.includes(user.role) : false;

  // 1. Đưa useEffect lên trên cùng, trước mọi lệnh `return`
  useEffect(() => {
    // Chỉ thực hiện chuyển hướng khi ĐÃ CÓ user nhưng KHÔNG ĐÚNG vai trò
    if (user && !isAllowed) {
      toast.error("Bạn không có quyền truy cập trang này.");
      router.replace("/");
    }
  }, [user, isAllowed, router]); // Thêm các dependencies cần thiết

  // 2. Xử lý các giao diện (UI) sau khi khai báo xong Hooks
  if (!user) {
    return <div>Đang tải thông tin người dùng...</div>;
  }

  if (!isAllowed) {
    return <div>Không có quyền truy cập. Đang chuyển hướng...</div>;
  }

  // 3. Nếu qua được các bước trên -> Vai trò hợp lệ -> Hiển thị trang
  return <>{children}</>;
}
