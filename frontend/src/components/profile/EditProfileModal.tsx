import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Image from "next/image";
import { useUpdateProfile } from "@/hooks/useUserMutations";
import { User } from "@/@types/user.type";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

function EditProfileForm({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const updateMutation = useUpdateProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ fullName, avatarUrl }, { onSuccess: onClose });
  };

  const avatarSrc =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={avatarSrc}
          alt="Avatar"
          width={128}
          height={128}
          className="rounded-full object-cover border-4 border-gray-200"
          unoptimized
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">
            Liên kết ảnh đại diện
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Dán liên kết ảnh công khai để thay đổi ảnh đại diện.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Họ và tên
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
}: EditProfileModalProps) {
  if (!user) {
    return null;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium text-gray-900"
                >
                  Chỉnh sửa hồ sơ
                </Dialog.Title>
                <EditProfileForm key={user._id} user={user} onClose={onClose} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
