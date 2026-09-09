"use client";
import { useEffect, useRef } from "react"; // <--- Cập nhật: Thêm useRef
import { useUploadDocument } from "@/hooks/useUploadDocument";
import { UploadDocumentDto } from "@/@types/document.type";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// --- THÊM IMPORT NÀY ---
import { useQueryClient } from "@tanstack/react-query";
// --- KẾT THÚC ---

interface UploadDoneStepProps {
  files: File[];
  metadata: Partial<UploadDocumentDto>[];
}

export default function UploadDoneStep({
  files,
  metadata,
}: UploadDoneStepProps) {
  const router = useRouter();
  const mutation = useUploadDocument();
  // --- THÊM 2 DÒNG NÀY ---
  const queryClient = useQueryClient();
  const hasUploaded = useRef(false); // Thêm khóa (lock)
  // --- KẾT THÚC ---

  useEffect(() => {
    // Hàm này tự động chạy khi component được render
    const startUploads = async () => {
      // --- THÊM KIỂM TRA ---
      if (hasUploaded.current) return; // Nếu đã upload rồi, không chạy lại
      hasUploaded.current = true; // Đánh dấu là đã bắt đầu upload
      // --- KẾT THÚC ---

      const uploadToastId = toast.loading(
        `Đang tải lên ${files.length} tệp...`,
      );

      const uploadPromises = files.map((file, index) => {
        return mutation.mutateAsync({
          file,
          metadata: metadata[index],
        });
      });

      try {
        await Promise.all(uploadPromises);
        toast.success("Tất cả các tệp đã được tải lên!", { id: uploadToastId });

        // --- THÊM DÒNG NÀY ĐỂ XÓA CACHE ---
        queryClient.invalidateQueries({ queryKey: ["documents"] });
        // --- KẾT THÚC ---

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch {
        toast.error("Có lỗi xảy ra khi tải lên tệp.", { id: uploadToastId });
        hasUploaded.current = false;
      }
    };

    startUploads();
  }, [files, metadata, mutation, router, queryClient]); // Thêm queryClient vào dependencies

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold">Đang xử lý...</h2>
      <p>Vui lòng không đóng tab này.</p>
    </div>
  );
}
