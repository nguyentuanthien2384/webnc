// src/hooks/useMyStats.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

interface MyStats {
  totalUploads: number;
  totalDownloads: number;
  avgDownloadsPerDoc: number;
}

const getMyStats = async (): Promise<MyStats> => {
  const response = await api.get("/users/me/stats");
  return response.data;
};

export const useMyStats = () => {
  return useQuery({
    queryKey: ["myStats"],
    queryFn: getMyStats,
  });
};
