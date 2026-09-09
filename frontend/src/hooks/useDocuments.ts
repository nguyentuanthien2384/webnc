import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Document } from "@/@types/document.type";
import qs from "qs";

interface DocumentsResponse {
  data: Document[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useDocuments = (
  sortBy: string,
  sortOrder: string,
  subjectIds: string[],
  search: string,
) => {
  const getDocuments = async (): Promise<DocumentsResponse> => {
    const params: Record<string, unknown> = {
      sortBy,
      sortOrder,
      search: search || undefined,
    };

    if (subjectIds.length > 0) {
      params.subjects = subjectIds;
    }

    const response = await api.get("/documents", {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "brackets" }),
    });
    return response.data;
  };

  return useQuery({
    queryKey: ["documents", sortBy, sortOrder, subjectIds.join(","), search],
    queryFn: getDocuments,
  });
};
