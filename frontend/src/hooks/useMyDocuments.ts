// src/hooks/useMyDocuments.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Document } from "@/@types/document.type";

// Copy interface DocumentsResponse từ useDocuments.ts
interface DocumentsResponse {
  data: Document[];
  pagination: { total: number /* ... */ };
}

const getMyDocuments = async (): Promise<DocumentsResponse> => {
  const response = await api.get("/documents/my-uploads");
  return response.data;
};

export const useMyDocuments = () => {
  return useQuery({
    queryKey: ["myDocuments"],
    queryFn: getMyDocuments,
  });
};
