"use client";

import { useUploadsOverTime } from "@/hooks/useUploadsOverTime";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

function formatDate(date: string, includeYear = false) {
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return date;
  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

export default function UploadsOverTimeChart({ days }: { days: number }) {
  const { data = [], isLoading, isError, refetch } = useUploadsOverTime(days);
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (isLoading) {
    return (
      <div className="flex h-[320px] items-center justify-center" role="status">
        <p className="text-sm text-gray-500">Đang tải dữ liệu biểu đồ…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl bg-red-50 px-5 text-center" role="alert">
        <p className="text-sm text-red-700">Không thể tải xu hướng chia sẻ tài liệu.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex h-[320px] flex-col items-center justify-center rounded-xl bg-gray-50 px-5 text-center">
        <p className="text-sm font-medium text-gray-700">Chưa có tài liệu được đăng trong {days} ngày qua.</p>
        <p className="mt-1 text-xs text-gray-500">Biểu đồ sẽ xuất hiện khi có lượt chia sẻ mới.</p>
      </div>
    );
  }

  return (
    <section aria-label={`Biểu đồ tài liệu tải lên trong ${days} ngày, tổng cộng ${formatNumber(total)} tài liệu`}>
      <div className="mb-3 text-right text-xs font-medium text-gray-500">
        Tổng trong kỳ: <span className="font-semibold text-blue-700">{formatNumber(total)} tài liệu</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -14, bottom: 4 }} accessibilityLayer>
          <defs>
            <linearGradient id="uploadsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatDate(value)}
            minTickGap={24}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={42}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(label) => `Ngày ${formatDate(String(label), true)}`}
            formatter={(value) => [`${formatNumber(Number(value))} tài liệu`, "Tải lên"]}
            contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb", boxShadow: "0 8px 20px rgb(15 23 42 / 8%)" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Tải lên"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#uploadsAreaGradient)"
            dot={data.length === 1 ? { r: 4, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 } : false}
            activeDot={{ r: 5, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
