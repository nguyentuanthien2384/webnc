"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Lấy cả 3 state
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Chỉ thực thi logic SAU KHI đã khôi phục state
    if (!_hasHydrated) {
      return; // Nếu chưa khôi phục, không làm gì cả
    }

    // Nếu đã khôi phục xong VÀ không đăng nhập -> đá về /login
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [_hasHydrated, isAuthenticated, router]); // Dependencies

  // Nếu chưa khôi phục, hiển thị loading
  if (!_hasHydrated) {
    return <div>Đang tải phiên đăng nhập...</div>;
  }

  // Nếu đã khôi phục VÀ đã đăng nhập, hiển thị nội dung
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Nếu đã khôi phục VÀ không đăng nhập (đang trong quá trình redirect)
  return <div>Đang chuyển hướng...</div>;
}
