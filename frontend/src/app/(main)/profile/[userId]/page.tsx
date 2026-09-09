"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  useUserProfile,
  useUserStats,
  useUserDocuments,
} from "@/hooks/useUserProfile";
import DocumentCard from "@/components/documents/DocumentCard";
import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";
import { User } from "@/@types/user.type";
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface UserStats {
  totalUploads: number;
  totalDownloads: number;
  avgDownloadsPerDoc: number;
}

function UserProfileHeader({ user, stats }: { user: User; stats?: UserStats }) {
  const avatarSrc =
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&color=fff&size=200`;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          </div>
        </div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Image
              src={avatarSrc}
              alt={user.fullName}
              width={96}
              height={96}
              className="rounded-2xl object-cover border-4 border-white shadow-md flex-shrink-0"
              unoptimized
            />
            <div className="sm:pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1.5 text-xs text-gray-400">
                Tham gia {new Date(user.joinedDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CloudArrowUpIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Tổng uploads</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUploads ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Tổng lượt tải</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalDownloads ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">TB tải/tài liệu</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.avgDownloadsPerDoc ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const loggedInUser = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const userId = params.userId as string;

  useEffect(() => {
    if (hasHydrated) {
      if (userId === "me" || (loggedInUser && userId === loggedInUser._id)) {
        router.replace("/profile/me");
      }
    }
  }, [userId, loggedInUser, hasHydrated, router]);

  const { data: user, isLoading: isLoadingProfile } = useUserProfile(userId);
  const { data: stats, isLoading: isLoadingStats } = useUserStats(userId);
  const { data: docData, isLoading: isLoadingDocs } = useUserDocuments(userId);

  if (!hasHydrated) {
    return <main className="flex-1 p-8 bg-gray-50"><p>Đang tải phiên...</p></main>;
  }

  if (userId === "me" || (loggedInUser && userId === loggedInUser._id)) {
    return <main className="flex-1 p-8 bg-gray-50"><p>Đang chuyển hướng...</p></main>;
  }

  if (isLoadingProfile || isLoadingStats) {
    return (
      <main className="flex-1 p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto animate-pulse space-y-4">
          <div className="h-48 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">Không tìm thấy người dùng này</h2>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Quay về trang chủ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <UserProfileHeader user={user} stats={stats} />

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tài liệu của {user.fullName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{docData?.pagination.total || 0} tài liệu</p>
            </div>
          </div>

          <div>
            {isLoadingDocs && <p className="p-6 text-gray-500">Đang tải tài liệu...</p>}
            {docData && docData.data.length > 0 ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                {docData.data.map((doc) => (
                  <DocumentCard key={doc._id} doc={doc} viewMode="grid" />
                ))}
              </div>
            ) : (
              !isLoadingDocs && (
                <div className="p-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Người dùng này chưa đăng tải tài liệu nào.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
