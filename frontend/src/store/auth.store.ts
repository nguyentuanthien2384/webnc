import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/@types/user.type";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      setUser: (user) => set({ user }),

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

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        toast.success("Đã đăng xuất");
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
