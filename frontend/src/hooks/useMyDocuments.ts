// src/hooks/useMyDocuments.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Document } from "@/@types/document.type";

// Copy interface DocumentsResponse từ useDocuments.ts
interface DocumentsResponse {
  data: Document[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const getMyDocuments = async (page: number, year: string, month: string, limit: number): Promise<DocumentsResponse> => {
  const response = await api.get("/documents/my-uploads", {
    params: { page, limit, year: year || undefined, month: month || undefined },
  });
  return response.data;
};

export const useMyDocuments = (page = 1, year = "", month = "", limit = 10) => {
  return useQuery({
    queryKey: ["myDocuments", page, year, month, limit],
    queryFn: () => getMyDocuments(page, year, month, limit),
  });
};
