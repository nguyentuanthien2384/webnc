import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { User } from "@/@types/user.type";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";

export interface UpdateProfileDto {
  fullName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: UpdateProfileDto): Promise<User> => {
      const response = await api.patch("/users/me/profile", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      toast.success("Cập nhật hồ sơ thành công!");
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (err: Error) => toast.error(err.message || "Lỗi cập nhật."),
  });
};

export const useChangePassword = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: async (data: ChangePasswordDto): Promise<void> => {
      await api.post("/users/me/change-password", data);
    },
    onSuccess: () => {
      clearSession();
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Lỗi đổi mật khẩu."));
    },
  });
};
