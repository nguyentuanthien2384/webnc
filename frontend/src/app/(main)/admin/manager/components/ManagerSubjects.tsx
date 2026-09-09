"use client";
import { useState, useMemo } from "react";
import { useAdminSubjects, Subject } from "@/hooks/useAdminData";
import { useAdminStore } from "@/store/admin.store";
import { toast } from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

export default function ManageSubjects() {
  const { data: subjects, isLoading } = useAdminSubjects();
  const { addSubject, updateSubject, deleteSubject } = useAdminStore();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [managingFaculty, setManagingFaculty] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [search, setSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subject: Subject | null;
  }>({ isOpen: false, subject: null });

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()),
    );
  }, [subjects, search]);

  const handleStartEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setManagingFaculty(subject.managingFaculty || "");
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setName("");
    setCode("");
    setManagingFaculty("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject._id, { name, code, managingFaculty });
      toast.success("Cập nhật môn học thành công!");
      handleCancelEdit();
    } else {
      addSubject({ name, code, managingFaculty });
      toast.success("Đã tạo môn học mới!");
      setName("");
      setCode("");
      setManagingFaculty("");
    }
  };

  const handleDelete = () => {
    if (!deleteModal.subject) return;
    deleteSubject(deleteModal.subject._id);
    toast.success("Đã xóa môn học!");
    setDeleteModal({ isOpen: false, subject: null });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Cột 1: Form */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          {editingSubject
            ? `Đang sửa: ${editingSubject.name}`
            : "Thêm môn học mới"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border rounded-lg bg-gray-50"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên môn học
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="VD: Cấu trúc dữ liệu và thuật toán"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Mã học phần
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="VD: CSE703006"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Khoa quản lý
            </label>
            <input
              type="text"
              value={managingFaculty}
              onChange={(e) => setManagingFaculty(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="VD: CSE"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingSubject ? "Cập nhật" : "Thêm môn học"}
            </button>
            {editingSubject && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Cột 2: Danh sách */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Danh sách môn học ({filteredSubjects.length})
        </h3>
        <input
          type="text"
          placeholder="Tìm môn học theo tên hoặc mã..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="h-96 overflow-y-auto border rounded-md p-4">
          {isLoading && (
            <p className="text-center text-gray-500">Đang tải...</p>
          )}
          <ul className="space-y-2">
            {filteredSubjects.map((subject) => (
              <li
                key={subject._id}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
              >
                <div>
                  <strong>{subject.name}</strong> ({subject.code})
                  <span className="text-gray-500 text-sm block">
                    {subject.managingFaculty}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartEdit(subject)}
                    title="Sửa"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <PencilIcon className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, subject })}
                    title="Xóa"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <TrashIcon className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, subject: null })}
        onConfirm={handleDelete}
        title="Xác nhận xóa môn học"
        message={`Bạn có chắc muốn xóa môn học "${deleteModal.subject?.name}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
