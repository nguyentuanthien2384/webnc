"use client";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminUsers } from "@/hooks/useAdminData";
import {
  useUpdateUserRole,
  useBlockUser,
  useUnblockUser,
  useResetPassword,
  useDeleteUserAdmin,
} from "@/hooks/useAdminMutateUser";
import { User } from "@/@types/user.type";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import RoleGuard from "@/components/auth/RoleGuard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Pagination from "@/components/common/Pagination";
import { downloadExcel } from "@/lib/downloadExcel";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

function ManageUsersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("joinedDate");
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [pageState, setPageState] = useState({ key: "", page: 1 });
  const filterKey = JSON.stringify([debouncedSearchTerm, roleFilter, sortBy]);
  const page = pageState.key === filterKey ? pageState.page : 1;
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.clearSession);
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "ADMIN";

  const { data: usersData, isLoading, isError } = useAdminUsers(
    debouncedSearchTerm,
    roleFilter,
    sortBy,
    page,
  );

  const roleMutation = useUpdateUserRole();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const resetPassMutation = useResetPassword();
  const deleteUserMutation = useDeleteUserAdmin();

  const delegateAdminMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await api.post(`/admin/delegate-admin/${targetUserId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Ủy quyền Admin thành công! Bạn sẽ được đăng xuất.");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 1500);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Ủy quyền thất bại."));
    },
  });

  const [modalState, setModalState] = useState<{
    action: "block" | "unblock" | "delegate" | "delete";
    user: User;
  } | null>(null);

  const handleResetPassword = (user: User) => {
    if (window.confirm(`Reset mật khẩu cho ${user.email}?`)) {
      resetPassMutation.mutate(user._id);
    }
  };

  const handleConfirmAction = () => {
    if (!modalState) return;
    const { action, user } = modalState;

    if (action === "block") {
      blockMutation.mutate(user._id);
    } else if (action === "unblock") {
      unblockMutation.mutate(user._id);
    } else if (action === "delegate") {
      delegateAdminMutation.mutate(user._id);
    } else if (action === "delete") {
      deleteUserMutation.mutate(user._id);
    }

    setModalState(null);
  };

  const handleExcelExport = async () => {
    if (!usersData?.data.length || isLoading || isError || isExportingExcel) return;
    setIsExportingExcel(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadExcel(`unishare-users-page-${page}-${today}.xlsx`, [{
        name: "Người dùng",
        headers: ["Họ tên", "Email", "Vai trò", "Trạng thái", "Số tài liệu", "Lượt tải", "Ngày tham gia"],
        rows: usersData.data.map((user) => [
          user.fullName,
          user.email,
          user.role,
          user.status,
          user.uploadsCount ?? 0,
          user.downloadsCount ?? 0,
          user.joinedDate ? new Date(user.joinedDate) : null,
        ]),
        widths: [28, 34, 17, 17, 16, 16, 20],
        formats: { 5: "#,##0", 6: "#,##0", 7: "dd/mm/yyyy" },
      }]);
    } catch {
      toast.error("Không thể xuất file Excel. Vui lòng thử lại.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm user theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">Tất cả vai trò</option>
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="joinedDate">Ngày tham gia</option>
          <option value="downloadsCount">Lượt tải xuống</option>
          <option value="uploadsCount">Số uploads</option>
          <option value="fullName">Tên</option>
        </select>
        <button
          type="button"
          onClick={handleExcelExport}
          disabled={!usersData?.data.length || isLoading || isError || isExportingExcel}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {isExportingExcel ? "Đang xuất..." : "Xuất Excel trang này"}
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên / Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploads / Downloads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && usersData?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không tìm thấy user nào
                </td>
              </tr>
            )}
            {usersData?.data.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.fullName}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-800"
                        : user.role === "MODERATOR"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-blue-600 font-medium">
                    {user.uploadsCount ?? 0}
                  </span>
                  {" / "}
                  <span className="text-green-600 font-medium">
                    {user.downloadsCount ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.status === "ACTIVE" ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 flex-wrap">
                    {isAdmin && user.role === "USER" && (
                      <button
                        onClick={() =>
                          roleMutation.mutate({
                            userId: user._id,
                            role: "MODERATOR",
                          })
                        }
                        className="text-blue-600 hover:text-blue-900 hover:underline"
                      >
                        Thăng cấp
                      </button>
                    )}
                    {isAdmin && user.role === "MODERATOR" && (
                      <>
                        <button
                          onClick={() =>
                            roleMutation.mutate({
                              userId: user._id,
                              role: "USER",
                            })
                          }
                          className="text-yellow-600 hover:text-yellow-900 hover:underline"
                        >
                          Giáng cấp
                        </button>
                        <button
                          onClick={() =>
                            setModalState({ action: "delegate", user })
                          }
                          className="text-purple-600 hover:text-purple-900 hover:underline"
                        >
                          Ủy quyền Admin
                        </button>
                      </>
                    )}

                    {user.role === "USER" && (
                      <>
                        {user.status === "ACTIVE" ? (
                          <button
                            onClick={() =>
                              setModalState({ action: "block", user })
                            }
                            className="text-red-600 hover:text-red-900 hover:underline"
                          >
                            Khóa
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setModalState({ action: "unblock", user })
                            }
                            className="text-green-600 hover:text-green-900 hover:underline"
                          >
                            Mở khóa
                          </button>
                        )}

                        {isAdmin && <button
                          onClick={() => handleResetPassword(user)}
                          className="text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          Reset Pass
                        </button>}
                        {isAdmin && (
                          <button
                            onClick={() =>
                              setModalState({ action: "delete", user })
                            }
                            className="text-red-700 hover:text-red-900 hover:underline"
                          >
                            Xóa tài khoản
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isError && <p role="alert" className="mt-3 text-red-600">Không thể tải danh sách người dùng.</p>}
      <Pagination page={page} totalPages={usersData?.pagination.totalPages ?? 0} onPageChange={(page) => setPageState({ key: filterKey, page })} />

      <DeleteConfirmModal
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
        onConfirm={handleConfirmAction}
        title={
          modalState?.action === "delete"
            ? "Xác nhận xóa tài khoản"
            : modalState?.action === "delegate"
            ? "Xác nhận ủy quyền Admin"
            : `Xác nhận ${modalState?.action === "block" ? "Khóa" : "Mở khóa"} User`
        }
        message={
          modalState?.action === "delete"
            ? `Bạn có chắc muốn xóa vĩnh viễn tài khoản "${modalState?.user.fullName}" và toàn bộ tài liệu họ đã đăng? Hành động này không thể hoàn tác.`
            : modalState?.action === "delegate"
            ? `Bạn có chắc muốn ủy quyền Admin cho "${modalState?.user.fullName}"? Bạn sẽ trở thành Moderator và bị đăng xuất.`
            : `Bạn có chắc muốn ${modalState?.action === "block" ? "khóa" : "mở khóa"} người dùng "${modalState?.user.email}"?`
        }
      />
    </div>
  );
}

export default function ManageUsersProtected() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]}>
      <ManageUsersContent />
    </RoleGuard>
  );
}
