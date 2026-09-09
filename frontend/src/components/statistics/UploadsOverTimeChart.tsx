"use client";
import { useUploadsOverTime } from "@/hooks/useUploadsOverTime";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// --- NHẬN 'days' TỪ PROPS ---
export default function UploadsOverTimeChart({ days }: { days: number }) {
  // Truyền 'days' vào hook
  const { data, isLoading } = useUploadsOverTime(days);
  // --- KẾT THÚC CẬP NHẬT ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p>Đang tải dữ liệu biểu đồ...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p>Không có dữ liệu upload trong khoảng thời gian này.</p>
      </div>
    );
  }

  // Định dạng lại ngày tháng
  const formattedData = data?.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
