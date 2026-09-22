"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const logout = useAuthStore((s) => s.clearSession);
  const router = useRouter();

  const deleteMutation = useMutation({
    mutationFn: async (pwd: string) => {
      await api.delete("/users/me/account", { data: { password: pwd } });
    },
    onSuccess: () => {
      toast.success("Tài khoản đã được xóa thành công.");
      logout();
      router.push("/login");
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Xóa tài khoản thất bại."));
    },
  });

  const canDelete = password.length >= 6 && confirmText === "XOA TAI KHOAN";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;
    deleteMutation.mutate(password);
  };

  const handleClose = () => {
    setPassword("");
    setConfirmText("");
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Xóa tài khoản
                  </Dialog.Title>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-700 font-medium mb-1">
                    Cảnh báo: Hành động này không thể hoàn tác!
                  </p>
                  <p className="text-sm text-red-600">
                    Toàn bộ tài liệu bạn đã upload, hồ sơ cá nhân và mọi dữ
                    liệu liên quan sẽ bị xóa vĩnh viễn.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhập mật khẩu để xác nhận
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Mật khẩu hiện tại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nhập{" "}
                      <span className="font-bold text-red-600">
                        XOA TAI KHOAN
                      </span>{" "}
                      để xác nhận
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="XOA TAI KHOAN"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={!canDelete || deleteMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {deleteMutation.isPending
                        ? "Đang xóa..."
                        : "Xóa tài khoản"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
