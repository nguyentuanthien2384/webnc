"use client";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminDocuments } from "@/hooks/useAdminData";
import {
  useBlockDocument,
  useUnblockDocument,
  useDeleteDocumentAdmin,
} from "@/hooks/useAdminMutateDocument";
import { Document as DocType } from "@/@types/document.type";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { useAuthStore } from "@/store/auth.store"; // Import để kiểm tra quyền Admin

export default function ManageDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { user } = useAuthStore(); // Lấy user hiện tại
  const isAdmin = user?.role === "ADMIN";

  const { data: docData, isLoading } = useAdminDocuments(debouncedSearchTerm);

  // Mutations
  const blockMutation = useBlockDocument();
  const unblockMutation = useUnblockDocument();
  const deleteMutation = useDeleteDocumentAdmin();

  // Modal state
  const [modalState, setModalState] = useState<{
    action: "block" | "unblock" | "delete";
    doc: DocType;
  } | null>(null);

  const handleConfirmAction = () => {
    if (!modalState) return;
    const { action, doc } = modalState;

    if (action === "block") {
      blockMutation.mutate(doc._id);
    } else if (action === "unblock") {
      unblockMutation.mutate(doc._id);
    } else if (action === "delete") {
      deleteMutation.mutate(doc._id);
    }
    setModalState(null);
  };

  const getActionTitle = () => {
    if (!modalState) return "";
    if (modalState.action === "block") return "Xác nhận Block tài liệu";
    if (modalState.action === "unblock") return "Xác nhận Unblock tài liệu";
    if (modalState.action === "delete") return "Xác nhận XÓA VĨNH VIỄN";
    return "";
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Tìm kiếm tài liệu</h3>
      <input
        type="text"
        placeholder="Tìm tài liệu theo tiêu đề..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-4"
      />

      {/* Bảng hiển thị tài liệu */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tài liệu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Người đăng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            )}
            {docData?.data.map((doc) => (
              <tr key={doc._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {doc.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {doc.subject?.name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.uploader?.fullName || "Không rõ"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {doc.status === "VISIBLE" ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Visible
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Blocked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Nút Block/Unblock */}
                  {doc.status === "VISIBLE" ? (
                    <button
                      onClick={() => setModalState({ action: "block", doc })}
                      className="text-red-600 hover:text-red-900"
                    >
                      Block
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalState({ action: "unblock", doc })}
                      className="text-green-600 hover:text-green-900"
                    >
                      Unblock
                    </button>
                  )}

                  {/* Nút Delete (Chỉ Admin) */}
                  {isAdmin && (
                    <button
                      onClick={() => setModalState({ action: "delete", doc })}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal xác nhận */}
      <DeleteConfirmModal
        isOpen={!!modalState}
        onClose={() => setModalState(null)}
        onConfirm={handleConfirmAction}
        title={getActionTitle()}
        message={`Bạn có chắc muốn thực hiện hành động này với tài liệu "${modalState?.doc.title}"?`}
      />
    </div>
  );
}
