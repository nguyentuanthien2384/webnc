import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Document } from "@/@types/document.type";

export const useDocumentDetail = (id: string) => {
  return useQuery<Document>({
    queryKey: ["document", id],
    queryFn: async () => {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
