import { toast } from "react-hot-toast";
import { useAdminStore } from "@/store/admin.store";
import { UserRole } from "@/@types/user.type";
import { useCallback } from "react";

export const useUpdateUserRole = () => {
  const updateRole = useAdminStore((s) => s.updateUserRole);
  const mutate = useCallback(
    ({ userId, role }: { userId: string; role: UserRole }) => {
      void updateRole(userId, role)
        .then(() => toast.success(`Đã cập nhật vai trò thành ${role}!`))
        .catch(() => toast.error("Không thể cập nhật vai trò."));
    },
    [updateRole],
  );
  return { mutate, isPending: false };
};

export const useBlockUser = () => {
  const block = useAdminStore((s) => s.blockUser);
  const mutate = useCallback(
    (userId: string) => {
      void block(userId)
        .then(() => toast.success("Đã khóa người dùng."))
        .catch(() => toast.error("Không thể khóa người dùng."));
    },
    [block],
  );
  return { mutate, isPending: false };
};

export const useUnblockUser = () => {
  const unblock = useAdminStore((s) => s.unblockUser);
  const mutate = useCallback(
    (userId: string) => {
      void unblock(userId)
        .then(() => toast.success("Đã mở khóa người dùng."))
        .catch(() => toast.error("Không thể mở khóa người dùng."));
    },
    [unblock],
  );
  return { mutate, isPending: false };
};

export const useResetPassword = () => {
  const resetPass = useAdminStore((s) => s.resetPassword);
  const mutate = useCallback(
    async (userId: string) => {
      try {
        const result = await resetPass(userId);
        toast.success(`${result.message}\nMật khẩu mới là: ${result.newPassword}`, {
          duration: 10000,
        });
      } catch {
        toast.error("Không thể đặt lại mật khẩu.");
      }
    },
    [resetPass],
  );
  return { mutate, isPending: false };
};

export const useDeleteUserAdmin = () => {
  const deleteUser = useAdminStore((s) => s.deleteUser);
  const mutate = useCallback(
    async (userId: string) => {
      try {
        await deleteUser(userId);
        toast.success("Đã xóa tài khoản và các tài liệu của người dùng.");
      } catch {
        toast.error("Không thể xóa tài khoản này.");
      }
    },
    [deleteUser],
  );
  return { mutate, isPending: false };
};
