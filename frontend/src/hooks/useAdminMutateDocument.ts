import { toast } from "react-hot-toast";
import { useAdminStore } from "@/store/admin.store";
import { useCallback } from "react";

export const useBlockDocument = () => {
  const blockDoc = useAdminStore((s) => s.blockDocument);
  return {
    mutate: (docId: string) => {
      void blockDoc(docId)
        .then(() => toast.success("Đã khóa tài liệu."))
        .catch(() => toast.error("Không thể khóa tài liệu."));
    },
    isPending: false,
  };
};

export const useUnblockDocument = () => {
  const unblockDoc = useAdminStore((s) => s.unblockDocument);
  return {
    mutate: (docId: string) => {
      void unblockDoc(docId)
        .then(() => toast.success("Đã mở khóa tài liệu."))
        .catch(() => toast.error("Không thể mở khóa tài liệu."));
    },
    isPending: false,
  };
};

export const useDeleteDocumentAdmin = () => {
  const deleteDoc = useAdminStore((s) => s.deleteDocument);
  const mutate = useCallback(
    (docId: string) => {
      void deleteDoc(docId)
        .then(() => toast.success("Đã xóa vĩnh viễn tài liệu."))
        .catch(() => toast.error("Không thể xóa tài liệu."));
    },
    [deleteDoc],
  );
  return { mutate, isPending: false };
};
