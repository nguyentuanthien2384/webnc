import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/@types/user.type";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import axios from "axios";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      setUser: (user) => set((state) => ({
        user: {
          ...state.user,
          ...user,
          permissions: user.permissions ??
            (state.user?.role === user.role ? state.user?.permissions : undefined),
        },
      })),

      login: async (email, password) => {
        try {
          const response = await api.post("/auth/login", { email, password });
          const { accessToken, user } = response.data;
          set({ user, token: accessToken, isAuthenticated: true });
          toast.success("Đăng nhập thành công!");
        } catch (error: unknown) {
          throw error;
        }
      },

      clearSession: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      logout: async () => {
        const token = get().token;
        get().clearSession();
        if (!token) return;
        try {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          });
          toast.success("Đã đăng xuất khỏi tất cả phiên đăng nhập");
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            toast.success("Đã đăng xuất");
          } else {
            toast.error("Đã thoát trên thiết bị này, nhưng chưa thể vô hiệu hóa phiên trên máy chủ.");
          }
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
      },
    },
  ),
);
