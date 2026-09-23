"use client";

import Link from "next/link";
import { useState, type ComponentType, type SVGProps } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RoleGuard from "@/components/auth/RoleGuard";
import UploadsOverTimeChart from "@/components/statistics/UploadsOverTimeChart";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import type { Document } from "@/@types/document.type";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
const numberFormatter = new Intl.NumberFormat("vi-VN");
const averageFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa rõ ngày" : date.toLocaleDateString("vi-VN");
}

function MetricCard({ label, value, description, icon: Icon, tone }: {
  label: string;
  value: string;
  description: string;
  icon: IconComponent;
  tone: "blue" | "emerald" | "violet" | "amber";
}) {
  const iconTone = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-rose-100 bg-rose-50/60 p-6 text-center">
      <ExclamationTriangleIcon className="h-6 w-6 text-rose-500" aria-hidden="true" />
      <p className="mt-2 text-sm font-medium text-slate-700">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">
        Thử lại
      </button>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Đang tải tài liệu">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-2.5 w-1/2 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentList({ documents, variant }: { documents: Document[]; variant: "recent" | "popular" }) {
  if (documents.length === 0) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center text-center">
        <DocumentTextIcon className="h-9 w-9 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          {variant === "recent" ? "Chưa có tài liệu mới" : "Chưa có tài liệu phổ biến"}
        </p>
        <p className="mt-1 text-xs text-slate-500">Tài liệu sẽ xuất hiện tại đây khi có dữ liệu.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {documents.map((document, index) => (
        <li key={document._id}>
          <Link href={`/document/${document._id}`} className="group flex items-center gap-3 rounded-lg py-3 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${variant === "recent" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-sm font-bold tabular-nums text-slate-500"}`}>
              {variant === "recent" ? <DocumentTextIcon className="h-5 w-5" aria-hidden="true" /> : String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{document.title}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {variant === "recent"
                  ? `${document.uploader?.fullName || "Không rõ người đăng"} · ${formatDate(document.uploadDate)}`
                  : document.subject?.name || "Chưa phân loại"}
              </span>
            </span>
            {variant === "recent" ? (
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-600" aria-hidden="true" />
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-slate-500" aria-label={`${numberFormatter.format(document.downloadCount || 0)} lượt tải`}>
                <ArrowDownTrayIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {numberFormatter.format(document.downloadCount || 0)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DashboardContent() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = usePlatformStats();
  const { data: recentResponse, isLoading: isRecentLoading, isError: isRecentError, refetch: refetchRecent } = useDocuments("uploadDate", "desc", [], "", 1, 5);
  const { data: popularResponse, isLoading: isPopularLoading, isError: isPopularError, refetch: refetchPopular } = useDocuments("downloadCount", "desc", [], "", 1, 5);
  const { data: pendingReports, isLoading: isReportsLoading, isError: isReportsError, refetch: refetchReports } = useQuery({
    queryKey: ["dashboardOpenReportsCount"],
    queryFn: async () => {
      const response = await api.get<{ pagination: { total: number } }>("/reports", { params: { status: "OPEN", page: 1 } });
      return response.data.pagination.total;
    },
  });
  const hasStaleData =
    (isStatsError && !!stats) ||
    (isRecentError && !!recentResponse) ||
    (isPopularError && !!popularResponse) ||
    (isReportsError && pendingReports !== undefined);

  const refreshDashboard = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["platformStats"] }),
        queryClient.invalidateQueries({ queryKey: ["documents"] }),
        queryClient.invalidateQueries({ queryKey: ["uploadsOverTime", days] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardOpenReportsCount"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className="min-w-0 flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">UniShare / Bảng điều khiển</p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Chào {user?.fullName || "bạn"}</h1>
              <p className="mt-2 text-sm leading-6 text-blue-100 sm:text-base">Theo dõi hoạt động chia sẻ và những việc cần xử lý tại một nơi.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button type="button" onClick={() => void refreshDashboard()} disabled={isRefreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
                <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                {isRefreshing ? "Đang làm mới..." : "Làm mới"}
              </button>
              <Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-900 transition hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <CloudArrowUpIcon className="h-4 w-4" aria-hidden="true" />Đăng tài liệu
              </Link>
            </div>
          </div>
        </header>

        {hasStaleData && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span>Một số dữ liệu chưa cập nhật. Số liệu đang hiển thị có thể đã cũ.</span>
            <button type="button" onClick={() => void refreshDashboard()} disabled={isRefreshing} className="font-semibold underline underline-offset-2 hover:text-amber-700 disabled:opacity-60">Thử làm mới</button>
          </div>
        )}

        <section aria-labelledby="dashboard-metrics-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="dashboard-metrics-heading" className="text-lg font-bold text-slate-900">Số liệu tổng quan</h2>
              <p className="mt-0.5 text-sm text-slate-500">Hoạt động trên toàn nền tảng.</p>
            </div>
            <Link href="/statistics" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900">Xem thống kê chi tiết<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          {isStatsLoading && !stats ? (
            <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Đang tải số liệu tổng quan">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-40 rounded-2xl bg-slate-200" />)}
            </div>
          ) : isStatsError && !stats ? (
            <SectionError message="Không thể tải số liệu tổng quan." onRetry={() => void refetchStats()} />
          ) : stats ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Tổng tài liệu" value={numberFormatter.format(stats.totalUploads)} description="Bao gồm tài liệu bị chặn" icon={DocumentTextIcon} tone="blue" />
              <MetricCard label="Lượt tải xuống" value={numberFormatter.format(stats.totalDownloads)} description="Lũy kế từ trước đến nay" icon={ArrowDownTrayIcon} tone="emerald" />
              <MetricCard label="Người dùng hoạt động" value={numberFormatter.format(stats.activeUsers)} description="Tài khoản đang tham gia" icon={UsersIcon} tone="violet" />
              <MetricCard label="Tải xuống / tài liệu" value={averageFormatter.format(stats.avgDlPerDoc)} description="Trung bình trên tài liệu hiện có" icon={ChartBarIcon} tone="amber" />
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="dashboard-trend-heading" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 id="dashboard-trend-heading" className="text-lg font-bold text-slate-900">Xu hướng chia sẻ tài liệu</h2>
                <p className="mt-1 text-sm text-slate-500">Tài liệu được đăng trong khoảng thời gian đã chọn.</p>
              </div>
              <div className="inline-flex self-start rounded-xl bg-slate-100 p-1" role="group" aria-label="Khoảng thời gian biểu đồ">
                {[7, 30, 90].map((option) => (
                  <button key={option} type="button" onClick={() => setDays(option)} aria-pressed={days === option} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${days === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    {option} ngày
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 min-w-0"><UploadsOverTimeChart days={days} /></div>
          </section>

          <aside aria-labelledby="dashboard-attention-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="dashboard-attention-heading" className="text-lg font-bold text-slate-900">Cần chú ý</h2>
                <p className="mt-1 text-sm text-slate-500">Các báo cáo đang chờ xử lý.</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${pendingReports === 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {pendingReports === 0 ? <CheckCircleIcon className="h-5 w-5" aria-hidden="true" /> : <ExclamationTriangleIcon className="h-5 w-5" aria-hidden="true" />}
              </span>
            </div>
            <div className="mt-6">
              {isReportsLoading && pendingReports === undefined ? (
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" aria-label="Đang tải báo cáo" />
              ) : isReportsError && pendingReports === undefined ? (
                <SectionError message="Không thể tải báo cáo chờ xử lý." onRetry={() => void refetchReports()} />
              ) : (
                <div className={`rounded-xl border p-4 ${pendingReports === 0 ? "border-emerald-100 bg-emerald-50/70" : "border-amber-100 bg-amber-50/70"}`}>
                  <p className={`text-4xl font-bold tabular-nums tracking-tight ${pendingReports === 0 ? "text-emerald-900" : "text-amber-900"}`}>{numberFormatter.format(pendingReports ?? 0)}</p>
                  <p className={`mt-1 text-sm font-medium ${pendingReports === 0 ? "text-emerald-900" : "text-amber-900"}`}>Báo cáo chờ xử lý</p>
                  <p className={`mt-1 text-xs leading-5 ${pendingReports === 0 ? "text-emerald-800" : "text-amber-800"}`}>{pendingReports === 0 ? "Không có báo cáo mới cần xử lý." : "Mở trang quản lý để xem và xử lý báo cáo."}</p>
                </div>
              )}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lối tắt</p>
              <Link href="/admin/manager?tab=reports" className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <span className="inline-flex items-center gap-2"><Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />Xử lý báo cáo</span><ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/admin/manager?tab=documents" className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <span className="inline-flex items-center gap-2"><DocumentTextIcon className="h-4 w-4" aria-hidden="true" />Quản lý tài liệu</span><ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="dashboard-recent-heading" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><h2 id="dashboard-recent-heading" className="text-lg font-bold text-slate-900">Tài liệu mới</h2><p className="mt-1 text-sm text-slate-500">Các tài liệu vừa được chia sẻ.</p></div>
              <ClockIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-4">
              {isRecentLoading && !recentResponse ? <ListSkeleton /> : isRecentError && !recentResponse ? <SectionError message="Không thể tải tài liệu mới." onRetry={() => void refetchRecent()} /> : <DocumentList documents={recentResponse?.data.slice(0, 5) ?? []} variant="recent" />}
            </div>
            <Link href="/" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900">Xem tất cả tài liệu<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </section>

          <section aria-labelledby="dashboard-popular-heading" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><h2 id="dashboard-popular-heading" className="text-lg font-bold text-slate-900">Tài liệu phổ biến</h2><p className="mt-1 text-sm text-slate-500">Tài liệu có nhiều lượt tải nhất.</p></div>
              <ArrowDownTrayIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-4">
              {isPopularLoading && !popularResponse ? <ListSkeleton /> : isPopularError && !popularResponse ? <SectionError message="Không thể tải tài liệu phổ biến." onRetry={() => void refetchPopular()} /> : <DocumentList documents={popularResponse?.data.filter((document) => document.downloadCount > 0).slice(0, 5) ?? []} variant="popular" />}
            </div>
            <Link href="/" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900">Khám phá tài liệu<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </section>
        </div>
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
