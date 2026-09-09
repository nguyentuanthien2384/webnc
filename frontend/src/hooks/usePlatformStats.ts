// src/hooks/usePlatformStats.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface PlatformStats {
  totalUploads: number;
  totalDownloads: number;
  activeUsers: number;
  avgDlPerDoc: number;
}

const getPlatformStats = async (): Promise<PlatformStats> => {
  const response = await api.get("/statistics/platform");
  return response.data;
};

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platformStats"],
    queryFn: getPlatformStats,
  });
};
