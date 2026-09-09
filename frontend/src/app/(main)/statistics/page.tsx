"use client";
import { useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import UploadsOverTimeChart from "@/components/statistics/UploadsOverTimeChart";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { useUploadsOverTime } from "@/hooks/useUploadsOverTime";
import { downloadCsv } from "@/lib/downloadCsv";
import {
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

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
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatisticsPageContent() {
  const { data: stats, isLoading } = usePlatformStats();
  const [days, setDays] = useState(30);
  const { data: uploads = [] } = useUploadsOverTime(days);

  const handleExport = () => {
    if (!stats) return;
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `unishare-statistics-${today}.csv`,
      ["Nhóm", "Chỉ số", "Giá trị"],
      [
        ["Tổng quan", "Tổng tài liệu", stats.totalUploads],
        ["Tổng quan", "Tổng lượt tải", stats.totalDownloads],
        ["Tổng quan", "Người dùng hoạt động", stats.activeUsers],
        ["Tổng quan", "Trung bình lượt tải / tài liệu", stats.avgDlPerDoc],
        ...uploads.map((item) => ["Tải lên theo ngày", item.date, item.count]),
      ],
    );
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

  if (!stats) return <div className="flex-1 p-8">Không có dữ liệu.</div>;

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống kê hệ thống</h1>
            <p className="mt-1 text-gray-500">Phân tích và thống kê hoạt động nền tảng</p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Xuất CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Tổng uploads"
            value={stats.totalUploads}
            icon={CloudArrowUpIcon}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Tổng downloads"
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
            title="TB tải/tài liệu"
            value={stats.avgDlPerDoc}
            icon={DocumentTextIcon}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Uploads theo thời gian</h2>
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
