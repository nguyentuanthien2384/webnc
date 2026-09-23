"use client";

import Link from "next/link";
import { useState, type ComponentType, type SVGProps } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useMyDocuments } from "@/hooks/useMyDocuments";
import { useMyStats } from "@/hooks/useMyStats";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { hasPermission, ROLE_LABELS } from "@/lib/permissions";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;
type Period = "month" | "year";
type UploadPoint = { date: string; count: number };
type UploadStats = {
  period: string;
  totalDocuments: number;
  totalDownloads: number;
  data: UploadPoint[];
};

const numberFormatter = new Intl.NumberFormat("vi-VN");
const averageFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Chưa rõ ngày" : date.toLocaleDateString("vi-VN");
}

function vietnamDateParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

function completeSeries(points: UploadPoint[], period: Period) {
  const { year, month, day } = vietnamDateParts();
  const first = new Date(Date.UTC(year, period === "month" ? month - 1 : 0, 1));
  const last = new Date(Date.UTC(year, month - 1, day));
  const counts = new Map(points.map((point) => [point.date, point.count]));
  const result: UploadPoint[] = [];
  for (let date = first; date <= last; date.setUTCDate(date.getUTCDate() + 1)) {
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

function StatCard({ label, value, note, icon: IconComponent, color }: {
  label: string;
  value: string;
  note: string;
  icon: Icon;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <IconComponent className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function DataError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-rose-100 bg-rose-50 p-5 text-center">
      <ExclamationTriangleIcon className="h-6 w-6 text-rose-600" aria-hidden="true" />
      <p className="mt-2 text-sm text-slate-700">{message}</p>
      <button type="button" onClick={retry} className="mt-3 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600">
        Thử lại
      </button>
    </div>
  );
}

function UploadTrend({ period, stats }: { period: Period; stats: UploadStats }) {
  const data = completeSeries(stats.data, period);
  if (stats.totalDocuments === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
        <ChartBarIcon className="h-10 w-10 text-slate-300" aria-hidden="true" />
        <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có tài liệu nào được đăng trong {period === "month" ? "tháng" : "năm"} này.</p>
        <p className="mt-1 text-xs text-slate-500">Tài liệu mới của bạn sẽ xuất hiện trên biểu đồ.</p>
      </div>
    );
  }

  return (
    <div aria-label={`${numberFormatter.format(stats.totalDocuments)} tài liệu được đăng trong ${period === "month" ? "tháng" : "năm"} này`}>
      <p className="mb-2 text-right text-xs text-slate-500">Đã đăng trong kỳ: <strong className="text-blue-700">{numberFormatter.format(stats.totalDocuments)} tài liệu</strong></p>
      <ResponsiveContainer width="100%" height={288}>
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -14, bottom: 4 }} accessibilityLayer>
          <defs>
            <linearGradient id="personalUploadsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.27} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5).split("-").reverse().join("/")} minTickGap={25} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={42} tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip labelFormatter={(label) => `Ngày ${String(label).split("-").reverse().join("/")}`} formatter={(value) => [`${numberFormatter.format(Number(value))} tài liệu`, "Đã đăng"]} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
          <Area type="monotone" dataKey="count" name="Đã đăng" stroke="#4f46e5" strokeWidth={2.5} fill="url(#personalUploadsGradient)" dot={data.length === 1 ? { r: 4 } : false} activeDot={{ r: 5 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function PersonalDashboard() {
  const user = useAuthStore((state) => state.user);
  const canUpload = hasPermission(user, "documents.upload");
  const actions = [
    { href: "/upload", label: "Đăng tài liệu mới", detail: "Chia sẻ bài giảng, đề cương hoặc bài tập", icon: CloudArrowUpIcon, allowed: canUpload },
    { href: "/profile/me", label: "Quản lý tài liệu của tôi", detail: "Xem, sửa và xóa tài liệu đã đăng", icon: UserCircleIcon, allowed: true },
    { href: "/editor", label: "Soạn thảo nội dung", detail: "Tiếp tục bản nháp của bạn", icon: PencilSquareIcon, allowed: hasPermission(user, "drafts.manage_own") },
    { href: "/", label: "Khám phá tài liệu", detail: "Tìm tài liệu học tập từ cộng đồng", icon: BookOpenIcon, allowed: true },
  ].filter((action) => action.allowed);
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<Period>("month");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: myStats, isLoading: isStatsLoading, isError: isStatsError, refetch: refetchStats } = useMyStats();
  const { data: myDocuments, isLoading: isDocumentsLoading, isError: isDocumentsError, refetch: refetchDocuments } = useMyDocuments(1, "", "", 5);
  const { data: uploadStats, isLoading: isTrendLoading, isError: isTrendError, refetch: refetchTrend } = useQuery<UploadStats>({
    queryKey: ["myUploadStats", period],
    queryFn: async () => (await api.get("/users/me/upload-stats", { params: { period } })).data,
  });
  const hasStaleData = (isStatsError && !!myStats) || (isDocumentsError && !!myDocuments) || (isTrendError && !!uploadStats);

  const refresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myStats"] }),
        queryClient.invalidateQueries({ queryKey: ["myDocuments"] }),
        queryClient.invalidateQueries({ queryKey: ["myUploadStats"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <main className="min-w-0 flex-1 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-700 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200">UniShare / Không gian của tôi · {user ? ROLE_LABELS[user.role] : ""}</p>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Chào {user?.fullName || "bạn"}</h1>
              <p className="mt-2 text-sm leading-6 text-indigo-100 sm:text-base">Theo dõi tài liệu bạn đã chia sẻ và mức độ đón nhận từ cộng đồng.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60">
                <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
                {isRefreshing ? "Đang làm mới..." : "Làm mới"}
              </button>
              {canUpload && (
                <Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  <CloudArrowUpIcon className="h-4 w-4" aria-hidden="true" />Đăng tài liệu
                </Link>
              )}
            </div>
          </div>
        </header>

        {hasStaleData && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span>Một số dữ liệu chưa cập nhật. Số liệu đang hiển thị có thể đã cũ.</span>
            <button type="button" onClick={() => void refresh()} disabled={isRefreshing} className="font-semibold underline underline-offset-2 hover:text-amber-700 disabled:opacity-60">Thử làm mới</button>
          </div>
        )}

        <section aria-labelledby="personal-metrics-heading">
          <div className="mb-4">
            <h2 id="personal-metrics-heading" className="text-lg font-bold text-slate-900">Hoạt động của bạn</h2>
            <p className="mt-0.5 text-sm text-slate-500">Các chỉ số liên quan đến tài liệu bạn đã đăng trên UniShare.</p>
          </div>
          {isStatsLoading && !myStats ? (
            <div role="status" className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Đang tải chỉ số cá nhân">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-40 rounded-2xl bg-slate-200" />)}
            </div>
          ) : isStatsError && !myStats ? (
            <DataError message="Không thể tải chỉ số cá nhân." retry={() => void refetchStats()} />
          ) : myStats ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Tài liệu của tôi" value={numberFormatter.format(myStats.totalUploads)} note="Hiện còn, gồm cả tài liệu bị khóa" icon={DocumentTextIcon} color="bg-blue-50 text-blue-600" />
              {isDocumentsLoading && !myDocuments ? (
                <div role="status" aria-label="Đang tải số tài liệu hiển thị" className="h-40 animate-pulse rounded-2xl bg-slate-200" />
              ) : isDocumentsError && !myDocuments ? (
                <div className="rounded-2xl border border-rose-100 bg-white p-5"><DataError message="Không thể tải số tài liệu hiển thị." retry={() => void refetchDocuments()} /></div>
              ) : (
                <StatCard label="Đang hiển thị" value={numberFormatter.format(myDocuments?.pagination.total ?? 0)} note="Tài liệu mọi người có thể xem" icon={BookOpenIcon} color="bg-emerald-50 text-emerald-600" />
              )}
              <StatCard label="Lượt tải tài liệu của tôi" value={numberFormatter.format(myStats.totalDownloads)} note="Lũy kế từ trước đến nay" icon={ArrowDownTrayIcon} color="bg-violet-50 text-violet-600" />
              <StatCard label="Tải xuống / tài liệu" value={averageFormatter.format(myStats.avgDownloadsPerDoc ?? 0)} note="Trung bình trên tài liệu hiện còn" icon={ChartBarIcon} color="bg-amber-50 text-amber-600" />
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section aria-labelledby="personal-trend-heading" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h2 id="personal-trend-heading" className="text-lg font-bold text-slate-900">Nhịp chia sẻ của bạn</h2>
                <p className="mt-1 text-sm text-slate-500">Số tài liệu bạn đăng theo từng ngày, gồm cả tài liệu đã bị khóa.</p>
              </div>
              <div role="group" aria-label="Khoảng thời gian biểu đồ cá nhân" className="inline-flex self-start rounded-xl bg-slate-100 p-1">
                {(["month", "year"] as const).map((option) => (
                  <button key={option} type="button" aria-pressed={period === option} onClick={() => setPeriod(option)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${period === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    {option === "month" ? "Tháng này" : "Năm nay"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 min-w-0">
              {isTrendLoading && !uploadStats ? <div role="status" className="flex h-72 items-center justify-center text-sm text-slate-500">Đang tải biểu đồ…</div> : isTrendError && !uploadStats ? <DataError message="Không thể tải xu hướng tài liệu của bạn." retry={() => void refetchTrend()} /> : uploadStats ? <UploadTrend period={period} stats={uploadStats} /> : null}
            </div>
          </section>

          <aside aria-labelledby="personal-actions-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="personal-actions-heading" className="text-lg font-bold text-slate-900">Tiếp tục công việc</h2>
            <p className="mt-1 text-sm text-slate-500">Đi đến các chức năng bạn có thể sử dụng.</p>
            <div className="mt-5 space-y-2">
              {actions.map(({ href, label, detail, icon: ActionIcon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-indigo-700"><ActionIcon className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="mt-0.5 block text-xs leading-4 text-slate-500">{detail}</span></span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-700" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <section aria-labelledby="personal-recent-heading" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="personal-recent-heading" className="text-lg font-bold text-slate-900">Tài liệu gần đây của tôi</h2><p className="mt-1 text-sm text-slate-500">Các tài liệu đang hiển thị, sắp xếp theo ngày đăng mới nhất.</p></div>
            <Link href="/profile/me" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900">Xem tất cả<ArrowRightIcon className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-4">
            {isDocumentsLoading && !myDocuments ? <div role="status" className="h-48 animate-pulse rounded-xl bg-slate-100" aria-label="Đang tải tài liệu của bạn" /> : isDocumentsError && !myDocuments ? <DataError message="Không thể tải tài liệu của bạn." retry={() => void refetchDocuments()} /> : myDocuments?.data.length ? (
              <ul className="divide-y divide-slate-100">
                {myDocuments.data.slice(0, 5).map((document) => (
                  <li key={document._id}>
                    <Link href={`/document/${document._id}`} className="group flex items-center gap-3 rounded-lg py-3 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><DocumentTextIcon className="h-5 w-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">{document.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{document.subject?.name || "Chưa phân loại"} · {formatDate(document.uploadDate)}</span></span>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums text-slate-500" aria-label={`${numberFormatter.format(document.downloadCount ?? 0)} lượt tải`}><ArrowDownTrayIcon className="h-3.5 w-3.5" aria-hidden="true" />{numberFormatter.format(document.downloadCount ?? 0)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <div className="flex min-h-40 flex-col items-center justify-center text-center"><DocumentTextIcon className="h-9 w-9 text-slate-300" aria-hidden="true" /><p className="mt-3 text-sm font-medium text-slate-700">Bạn chưa có tài liệu đang hiển thị.</p>{canUpload && <Link href="/upload" className="mt-2 text-sm font-semibold text-blue-700 hover:underline">Đăng tài liệu đầu tiên</Link>}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
