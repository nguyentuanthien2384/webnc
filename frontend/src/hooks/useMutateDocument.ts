import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { UploadDocumentDto } from "@/@types/document.type";
import axios from "axios";

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message || fallbackMessage;
  }
  return fallbackMessage;
};

const updateDocument = async ({
  docId,
  data,
}: {
  docId: string;
  data: Partial<UploadDocumentDto>;
}) => {
  const response = await api.patch(`/documents/${docId}`, data);
  return response.data;
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDocument,
    onSuccess: () => {
      toast.success("Cập nhật tài liệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["myDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Cập nhật thất bại"));
    },
  });
};

const deleteDocument = async (docId: string) => {
  const response = await api.delete(`/documents/${docId}`);
  return response.data;
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success("Đã xóa tài liệu!");
      queryClient.invalidateQueries({ queryKey: ["myDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Xóa thất bại"));
    },
  });
};
