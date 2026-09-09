import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { UpdateProfileDto, ChangePasswordDto } from "@/@types/user.type";
import { useAuthStore } from "@/store/auth.store";
import { User } from "@/@types/user.type";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: UpdateProfileDto): Promise<User> => {
      if (!currentUser) throw new Error("Chưa đăng nhập");
      const response = await api.patch("/users/me/profile", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      toast.success("Cập nhật thông tin thành công!");
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
    onError: (err: Error) =>
      toast.error(err.message || "Cập nhật thất bại"),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordDto): Promise<void> => {
      await api.post("/users/me/change-password", data);
    },
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Đổi mật khẩu thất bại"));
    },
  });
};
