"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import type { UserRole } from "@/@types/user.type";

interface CurrentSession {
  userId: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, token } = useAuthStore();
  const router = useRouter();
  const [verification, setVerification] = useState<"checking" | "verified" | "error">("checking");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      const destination = window.location.pathname + window.location.search + window.location.hash;
      router.replace(`/login?next=${encodeURIComponent(destination)}`);
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!_hasHydrated || !isAuthenticated) return;
    if (!token) {
      useAuthStore.getState().clearSession();
      return;
    }

    let active = true;
    let hasVerified = false;
    let inFlight = false;
    const refreshSession = async () => {
      if (inFlight) return;
      inFlight = true;
      if (!hasVerified) setVerification("checking");
      try {
        const { data } = await api.get<CurrentSession>("/auth/me");
        if (!active) return;
        const auth = useAuthStore.getState();
        if (auth.token !== token || !auth.user) return;
        if (data.userId !== auth.user._id) {
          auth.clearSession();
          return;
        }
        auth.setUser({
          ...auth.user,
          email: data.email,
          role: data.role,
          permissions: Array.isArray(data.permissions) ? data.permissions : undefined,
        });
        hasVerified = true;
        setVerification("verified");
      } catch {
        // The API interceptor clears invalid sessions on 401. An initial
        // network error blocks the page; later focus refreshes preserve forms.
        if (active && !hasVerified && useAuthStore.getState().isAuthenticated) {
          setVerification("error");
        }
      } finally {
        inFlight = false;
      }
    };

    void refreshSession();
    window.addEventListener("focus", refreshSession);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshSession);
    };
  }, [_hasHydrated, isAuthenticated, token, retryKey]);

  if (!_hasHydrated) {
    return <div role="status" className="p-6 text-center text-gray-600">Đang tải phiên đăng nhập...</div>;
  }

  if (isAuthenticated) {
    if (verification === "checking") {
      return <div role="status" className="p-6 text-center text-gray-600">Đang xác minh quyền truy cập...</div>;
    }
    if (verification === "error") {
      return <div role="alert" className="mx-auto mt-10 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900">
        <p>Chưa thể xác minh quyền truy cập. Vui lòng kiểm tra kết nối và thử lại.</p>
        <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-4 rounded-lg bg-amber-700 px-4 py-2 font-medium text-white hover:bg-amber-800">Thử lại</button>
      </div>;
    }
    return <>{children}</>;
  }

  return <div role="status" className="p-6 text-center text-gray-600">Đang chuyển hướng...</div>;
}
