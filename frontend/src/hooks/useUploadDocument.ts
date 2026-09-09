// src/hooks/useUploadDocument.ts
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { UploadDocumentDto } from "@/@types/document.type";

interface UploadPayload {
  file: File;
  metadata: Partial<UploadDocumentDto>;
}

const uploadDocument = async (payload: UploadPayload) => {
  const { file, metadata } = payload;

  // Chúng ta phải dùng FormData vì có file
  const formData = new FormData();
  formData.append("file", file);

  // Thêm metadata vào FormData
  (Object.keys(metadata) as (keyof typeof metadata)[]).forEach((key) => {
    formData.append(key, metadata[key] as string);
  });

  const response = await api.post("/documents/upload", formData);

  return response.data;
};

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: uploadDocument,
    // (Bạn có thể thêm onSuccess, onError ở đây để hiển thị toast)
  });
};
