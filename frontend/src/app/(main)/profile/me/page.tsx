"use client";
import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useMyDocuments } from "@/hooks/useMyDocuments";
import { Document } from "@/@types/document.type";
import {
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useDeleteDocument } from "@/hooks/useMutateDocument";
import EditDocumentModal from "@/components/profile/EditDocumentModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { useMyProfile } from "@/hooks/useMyProfile";
import { useAuthStore } from "@/store/auth.store";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import Pagination from "@/components/common/Pagination";

interface MyDocumentListItemProps {
  doc: Document;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

function MyDocumentListItem({ doc, onEdit, onDelete }: MyDocumentListItemProps) {
  const handleDownload = async () => {
    const toastId = toast.loading("Đang tải xuống...");
    try {
      const response = await api.get(`/documents/${doc._id}/download`, { responseType: "blob" });
      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], {
        type: typeof contentType === "string" ? contentType : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Tải xuống thành công!", { id: toastId });
    } catch {
      toast.error("Tải xuống thất bại.", { id: toastId });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition rounded-lg group">
      <Link href={`/document/${doc._id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <DocumentIcon className="w-5 h-5 text-blue-500" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition">
            {doc.title}
          </h3>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
              {doc.subject?.name || "Chưa phân loại"}
            </span>
            <span>{new Date(doc.uploadDate).toLocaleDateString("vi-VN")}</span>
            <span className="flex items-center gap-0.5">
              <ArrowDownTrayIcon className="w-3 h-3" />
              {doc.downloadCount}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex gap-1 transition">
        <button
          onClick={handleDownload}
          className="p-2 rounded-lg hover:bg-blue-50 transition"
          title="Tải xuống"
        >
          <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />
        </button>
        <button
          onClick={() => onEdit(doc)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
          title="Chỉnh sửa"
        >
          <PencilIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => onDelete(doc)}
          className="p-2 rounded-lg hover:bg-red-50 transition"
          title="Xóa"
        >
          <TrashIcon className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const [page, setPage] = useState(1);
  const deleteMutation = useDeleteDocument();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const { data: docData, isLoading, isError } = useMyDocuments(page, filterYear, filterMonth);

  const { data: apiUser } = useMyProfile();
  const storeUser = useAuthStore((s) => s.user);
  const user = apiUser ?? storeUser;

  const handleEditClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedDoc) {
      deleteMutation.mutate(selectedDoc._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setSelectedDoc(null);
          setPage(1);
        },
      });
    }
  };

  const filteredDocs = docData?.data ?? [];
  const currentYear = new Date().getFullYear();
  const joinedYear = user?.joinedDate ? new Date(user.joinedDate).getFullYear() : currentYear;
  const firstYear = Number.isFinite(joinedYear) ? Math.min(joinedYear, currentYear) : currentYear;
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, index) => currentYear - index);

  if (!user) {
    return (
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center text-gray-500">Đang tải thông tin người dùng...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <ProfileHeader
          user={user}
          onEditClick={() => setIsEditProfileOpen(true)}
          onChangePassClick={() => setIsChangePassOpen(true)}
        />

        {/* Documents Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tài liệu của tôi</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {docData?.pagination.total ?? 0} tài liệu
                {(filterYear || filterMonth) && " (đã lọc)"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <select
                value={filterYear}
                aria-label="Lọc theo năm"
                onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Tất cả năm</option>
                {years.map((y) => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
              <select
                value={filterMonth}
                aria-label="Lọc theo tháng"
                onChange={(e) => { setFilterMonth(e.target.value); setPage(1); }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Tất cả tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m.toString()}>Tháng {m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {isLoading && <p className="p-6 text-gray-500">Đang tải tài liệu của bạn...</p>}
            {isError && <p className="p-6 text-red-500">Lỗi khi tải tài liệu.</p>}

            {filteredDocs.length > 0
              ? filteredDocs.map((doc) => (
                  <MyDocumentListItem
                    key={doc._id}
                    doc={doc}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))
              : !isLoading && !isError && (
                  <div className="p-12 text-center">
                    <DocumentIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {filterYear || filterMonth
                        ? "Không có tài liệu nào trong khoảng thời gian này."
                        : "Bạn chưa tải lên tài liệu nào."}
                    </p>
                    {!filterYear && !filterMonth && (
                      <Link
                        href="/upload"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        Chia sẻ tài liệu đầu tiên
                      </Link>
                    )}
                  </div>
                )}
          </div>
        </div>

        <Pagination page={page} totalPages={docData?.pagination.totalPages ?? 0} onPageChange={setPage} />

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-6 border-b border-red-100">
            <h2 className="text-lg font-bold text-red-600">Vùng nguy hiểm</h2>
            <p className="text-sm text-gray-500 mt-1">
              Các thao tác dưới đây không thể hoàn tác. Vui lòng cân nhắc kỹ
              trước khi thực hiện.
            </p>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Xóa tài khoản</p>
              <p className="text-sm text-gray-500">
                Xóa vĩnh viễn tài khoản và toàn bộ tài liệu của bạn
              </p>
            </div>
            <button
              onClick={() => setIsDeleteAccountOpen(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>

        {/* Modals */}
        {user && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            user={user}
          />
        )}
        <ChangePasswordModal isOpen={isChangePassOpen} onClose={() => setIsChangePassOpen(false)} />
        <DeleteAccountModal isOpen={isDeleteAccountOpen} onClose={() => setIsDeleteAccountOpen(false)} />
        <EditDocumentModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} doc={selectedDoc} />
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Xác nhận xóa tài liệu"
          message={`Bạn có chắc chắn muốn xóa tài liệu "${selectedDoc?.title}"? Hành động này không thể hoàn tác.`}
        />
      </div>
    </main>
  );
}
