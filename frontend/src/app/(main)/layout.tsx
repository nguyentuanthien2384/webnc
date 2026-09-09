"use client";
import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Toàn bộ logic state (isSidebarOpen) đã được CHUYỂN vào page.tsx
  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        {/* Children (page.tsx) giờ sẽ chiếm toàn bộ không gian
            và tự quản lý layout (sidebar + main content) bên trong nó */}
        <div className="flex flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
}
