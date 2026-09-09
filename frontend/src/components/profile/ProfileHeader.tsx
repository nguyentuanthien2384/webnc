"use client";
import Image from "next/image";
import { User } from "@/@types/user.type";
import { useMyStats } from "@/hooks/useMyStats";
import {
  PencilIcon,
  ArrowDownTrayIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: typeof ArrowDownTrayIcon;
  color: string;
}) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface ProfileHeaderProps {
  user: User;
  onEditClick: () => void;
  onChangePassClick: () => void;
}

export default function ProfileHeader({
  user,
  onEditClick,
  onChangePassClick,
}: ProfileHeaderProps) {
  const { data: stats } = useMyStats();

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  const avatarSrc =
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff&size=200`;

  return (
    <>
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          </div>
        </div>

        {/* Info */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <Image
                src={avatarSrc}
                alt={user.fullName}
                width={96}
                height={96}
                className="rounded-2xl object-cover border-4 border-white shadow-md"
                unoptimized
              />
              <button
                type="button"
                onClick={onEditClick}
                aria-label="Chỉnh sửa ảnh đại diện"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <PencilIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Name & Actions */}
            <div className="flex-1 sm:pb-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-700"
                        : user.role === "MODERATOR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-400">
                      Tham gia {new Date(user.joinedDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onEditClick}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Sửa hồ sơ
                  </button>
                  <button
                    onClick={onChangePassClick}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <StatCard
          title="Tổng uploads"
          value={stats?.totalUploads ?? 0}
          icon={CloudArrowUpIcon}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Tổng lượt tải"
          value={stats?.totalDownloads ?? 0}
          icon={ArrowDownTrayIcon}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          title="TB tải/tài liệu"
          value={stats?.avgDownloadsPerDoc ?? 0}
          icon={DocumentTextIcon}
          color="bg-purple-50 text-purple-600"
        />
      </div>
    </>
  );
}
