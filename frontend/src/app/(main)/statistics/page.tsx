"use client";
import { useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import UploadsOverTimeChart from "@/components/statistics/UploadsOverTimeChart";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useUploadsOverTime } from "@/hooks/useUploadsOverTime";
import { downloadCsv } from "@/lib/downloadCsv";
import { downloadExcel } from "@/lib/downloadExcel";
import { toast } from "react-hot-toast";
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const numberFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: typeof CloudArrowUpIcon;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{typeof value === "number" ? numberFormatter.format(value) : value}</p>
        </div>
      </div>
    </div>
  );
}

function StatisticsPageContent() {
  const { data: stats, isLoading, isError: statsError, refetch: refetchStats } = usePlatformStats();
  const [days, setDays] = useState(30);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const { data: uploads = [], isLoading: uploadsLoading, isError: uploadsError } = useUploadsOverTime(days);
  const canExport = !!stats && !uploadsLoading && !uploadsError;

  const handleExport = () => {
    if (!canExport || !stats) return;
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `unishare-statistics-${today}.csv`,
      ["Nhóm", "Chỉ số", "Giá trị"],
      [
        ["Tổng quan", "Tổng tài liệu", stats.totalUploads],
        ["Tổng quan", "Lượt tải lũy kế", stats.totalDownloads],
        ["Tổng quan", "Người dùng hoạt động", stats.activeUsers],
        ["Tổng quan", "TB lượt tải / tài liệu hiện có", stats.avgDlPerDoc],
        ...uploads.map((item) => ["Tải lên theo ngày", item.date, item.count]),
      ],
    );
  };

  const handleExcelExport = async () => {
    if (!canExport || !stats || isExportingExcel) return;
    setIsExportingExcel(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await downloadExcel(`unishare-statistics-${days}d-${today}.xlsx`, [
        {
          name: "Tổng quan",
          headers: ["Chỉ số", "Giá trị"],
          rows: [
            ["Tổng tài liệu", stats.totalUploads],
            ["Lượt tải lũy kế", stats.totalDownloads],
            ["Người dùng hoạt động", stats.activeUsers],
            ["TB lượt tải / tài liệu hiện có", stats.avgDlPerDoc],
            ["Khoảng thời gian tải lên (ngày)", days],
          ],
          widths: [38, 18],
          formats: { 2: "#,##0.##" },
        },
        {
          name: `Tải lên ${days} ngày`,
          headers: ["Ngày", "Số tài liệu tải lên"],
          rows: uploads.map((item) => [new Date(`${item.date}T00:00:00`), item.count]),
          widths: [20, 24],
          formats: { 1: "dd/mm/yyyy", 2: "#,##0" },
        },
      ]);
    } catch {
      toast.error("Không thể xuất file Excel. Vui lòng thử lại.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return (
    <main className="flex-1 bg-gray-50 p-8">
      <div role={statsError ? "alert" : "status"} className="mx-auto max-w-7xl rounded-xl border border-gray-200 bg-white p-6 text-gray-700">
        <p>{statsError ? "Không thể tải số liệu thống kê." : "Không có dữ liệu thống kê."}</p>
        {statsError && <button type="button" onClick={() => void refetchStats()} className="mt-3 font-semibold text-blue-600 hover:underline">Thử lại</button>}
      </div>
    </main>
  );

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h1>
            <p className="mt-1 text-gray-500">Phân tích và thống kê hoạt động nền tảng</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Xuất CSV
            </button>
            <button
              type="button"
              onClick={handleExcelExport}
              disabled={!canExport || isExportingExcel}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {isExportingExcel ? "Đang xuất Excel..." : "Xuất Excel"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tổng tài liệu"
            value={stats.totalUploads}
            icon={CloudArrowUpIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Lượt tải lũy kế"
            value={stats.totalDownloads}
            icon={ArrowDownTrayIcon}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Người dùng hoạt động"
            value={stats.activeUsers}
            icon={UsersIcon}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            title="TB tải / tài liệu hiện có"
            value={stats.avgDlPerDoc}
            icon={DocumentTextIcon}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>
        <p className="mb-8 mt-3 text-xs text-gray-500">Tổng tài liệu gồm tài liệu bị chặn; lượt tải lũy kế tính cả tài liệu đã xóa.</p>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tài liệu được đăng theo thời gian</h2>
              <p className="text-sm text-gray-500 mt-0.5">Biểu đồ số lượng tài liệu được tải lên</p>
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { d: 7, label: "7 ngày" },
                { d: 30, label: "30 ngày" },
                { d: 90, label: "90 ngày" },
              ].map(({ d, label }) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={days === d}
                  onClick={() => setDays(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    days === d
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <UploadsOverTimeChart days={days} />
        </div>
      </div>
    </main>
  );
}

export default function StatisticsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]}>
      <StatisticsPageContent />
    </RoleGuard>
  );
}
