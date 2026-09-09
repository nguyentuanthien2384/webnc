"use client";

import Link from "next/link";
import { useState, type ComponentType, type SVGProps } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import UploadsOverTimeChart from "@/components/statistics/UploadsOverTimeChart";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuthStore } from "@/store/auth.store";
import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: IconComponent;
  iconClassName: string;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  );
}

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const { data: stats, isLoading: isStatsLoading } = usePlatformStats();
  const { data: documentResponse, isLoading: isDocumentsLoading } = useDocuments(
    "uploadDate",
    "desc",
    [],
    "",
  );
  const [days, setDays] = useState(30);

  const recentDocuments = documentResponse?.data.slice(0, 5) ?? [];
  const isLoading = isStatsLoading || isDocumentsLoading;

  return (
    <main className="min-h-full flex-1 bg-gray-50 p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600">Tổng quan nền tảng</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Chào {user?.fullName || "bạn"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Theo dõi hoạt động và quản lý nội dung UniShare từ một nơi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              Đăng tài liệu
            </Link>
            <Link
              href="/admin/manager"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              Quản lý
            </Link>
          </div>
        </header>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-36 rounded-2xl bg-gray-200" />
              ))}
            </div>
            <div className="h-80 rounded-2xl bg-gray-200" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Tài liệu đã chia sẻ"
                value={formatNumber(stats?.totalUploads ?? 0)}
                description="Tổng số tài liệu trên nền tảng"
                icon={DocumentTextIcon}
                iconClassName="bg-blue-50 text-blue-600"
              />
              <MetricCard
                label="Lượt tải xuống"
                value={formatNumber(stats?.totalDownloads ?? 0)}
                description="Mức độ sử dụng tài liệu"
                icon={ArrowDownTrayIcon}
                iconClassName="bg-emerald-50 text-emerald-600"
              />
              <MetricCard
                label="Người dùng hoạt động"
                value={formatNumber(stats?.activeUsers ?? 0)}
                description="Tài khoản đang tham gia"
                icon={UsersIcon}
                iconClassName="bg-violet-50 text-violet-600"
              />
              <MetricCard
                label="Tải xuống / tài liệu"
                value={stats?.avgDlPerDoc ?? 0}
                description="Trung bình trên mỗi tài liệu"
                icon={ChartBarIcon}
                iconClassName="bg-amber-50 text-amber-600"
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-3">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Xu hướng chia sẻ tài liệu</h2>
                    <p className="mt-1 text-sm text-gray-500">Số lượng tài liệu được tải lên theo thời gian.</p>
                  </div>
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    {[7, 30, 90].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDays(option)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                          days === option
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {option} ngày
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <UploadsOverTimeChart days={days} />
                </div>
              </div>

              <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Tài liệu mới</h2>
                    <p className="mt-1 text-sm text-gray-500">Cập nhật gần đây nhất.</p>
                  </div>
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <div className="mt-4 divide-y divide-gray-100">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((document) => (
                      <Link
                        key={document._id}
                        href={`/document/${document._id}`}
                        className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <DocumentTextIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-800 transition group-hover:text-blue-600">
                            {document.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {document.uploader?.fullName || "Không rõ người đăng"} · {new Date(document.uploadDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-blue-600" />
                      </Link>
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-gray-500">Chưa có tài liệu mới.</p>
                  )}
                </div>
                <Link
                  href="/"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Xem tất cả tài liệu
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]}>
      <DashboardContent />
    </RoleGuard>
  );
}
