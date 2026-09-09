"use client";
import { useState, useMemo } from "react";
import { useAdminMajors, useAdminSubjects, Major } from "@/hooks/useAdminData";
import { useAdminStore } from "@/store/admin.store";
import { toast } from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

export default function ManageMajors() {
  const { data: majors, isLoading: isLoadingMajors } = useAdminMajors();
  const { data: allSubjects, isLoading: isLoadingSubjects } =
    useAdminSubjects();
  const { addMajor, updateMajor, deleteMajor } = useAdminStore();

  const [name, setName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);

  const [search, setSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    major: Major | null;
  }>({ isOpen: false, major: null });

  const filteredMajors = useMemo(() => {
    if (!majors) return [];
    return majors.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [majors, search]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedSubjects(options);
  };

  const handleStartEdit = (major: Major) => {
    setEditingMajor(major);
    setName(major.name);
    setSelectedSubjects(major.subjects.map((s) => s._id));
  };

  const handleCancelEdit = () => {
    setEditingMajor(null);
    setName("");
    setSelectedSubjects([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMajor) {
      updateMajor(editingMajor._id, name, selectedSubjects);
      toast.success("Cập nhật ngành học thành công!");
      handleCancelEdit();
    } else {
      addMajor(name, selectedSubjects);
      toast.success("Đã tạo ngành học mới!");
      setName("");
      setSelectedSubjects([]);
    }
  };

  const handleDelete = () => {
    if (!deleteModal.major) return;
    deleteMajor(deleteModal.major._id);
    toast.success("Đã xóa ngành học!");
    setDeleteModal({ isOpen: false, major: null });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Cột 1: Form */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          {editingMajor
            ? `Đang sửa: ${editingMajor.name}`
            : "Thêm ngành học mới"}
        </h3>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 border rounded-lg bg-gray-50"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên ngành học
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="VD: CNTT - Truyền thông"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Chọn môn học (Giữ Ctrl/Cmd để chọn nhiều)
            </label>
            {isLoadingSubjects ? (
              <p className="text-sm text-gray-500">Đang tải môn học...</p>
            ) : (
              <select
                multiple
                value={selectedSubjects}
                onChange={handleSelectChange}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md"
              >
                {allSubjects?.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Đã chọn: {selectedSubjects.length} môn học
            </p>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingMajor ? "Cập nhật" : "Thêm ngành học"}
            </button>
            {editingMajor && (
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
          Danh sách ngành học ({filteredMajors.length})
        </h3>
        <input
          type="text"
          placeholder="Tìm ngành học theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="h-96 overflow-y-auto border rounded-md p-4">
          {isLoadingMajors && (
            <p className="text-center text-gray-500">Đang tải...</p>
          )}
          <ul className="space-y-4">
            {filteredMajors.map((major) => (
              <li key={major._id} className="p-2 rounded hover:bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <strong className="text-lg">{major.name}</strong>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(major)}
                      title="Sửa"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <PencilIcon className="w-5 h-5 text-blue-500" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, major })}
                      title="Xóa"
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-600">
                  {major.subjects.length > 0 ? (
                    major.subjects.map((sub) => (
                      <li key={sub._id}>
                        {sub.name} ({sub.code})
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">Chưa có môn học</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, major: null })}
        onConfirm={handleDelete}
        title="Xác nhận xóa ngành học"
        message={`Bạn có chắc muốn xóa ngành học "${deleteModal.major?.name}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
