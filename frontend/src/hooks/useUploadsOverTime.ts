import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface UploadsData {
  date: string; // (Backend trả về "2025-10-01")
  count: number;
}

// --- CẬP NHẬT HÀM NÀY ---
const getUploadsOverTime = async (days: number): Promise<UploadsData[]> => {
  const response = await api.get("/statistics/uploads-over-time", {
    params: {
      days: days, // Gửi ?days=...
    },
  });
  return response.data;
};

export const useUploadsOverTime = (days: number) => {
  return useQuery({
    queryKey: ["uploadsOverTime", days], // queryKey phải phụ thuộc vào 'days'
    queryFn: () => getUploadsOverTime(days),
  });
};
// --- KẾT THÚC CẬP NHẬT ---
