import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Document, UploadDocumentDto } from "@/@types/document.type";
import { useSubjects } from "@/hooks/useCategories";
import { useUpdateDocument } from "@/hooks/useMutateDocument";

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: Document | null;
}

const documentTypes = [
  "Lecture Notes",
  "Exam Paper",
  "Solved Exercises",
  "Tutorial",
  "Other",
];
const schoolYears = [
  "2024-2025",
  "2023-2024",
  "2022-2023",
  "2021-2022",
  "Older",
];

function EditDocumentForm({
  doc,
  onClose,
}: {
  doc: Document;
  onClose: () => void;
}) {
  const { data: allSubjects, isLoading: isLoadingSubjects } = useSubjects();
  const updateMutation = useUpdateDocument();
  const [formData, setFormData] = useState<Partial<UploadDocumentDto>>({
    title: doc.title,
    description: doc.description,
    subject: doc.subject._id,
    documentType: doc.documentType,
    schoolYear: doc.schoolYear,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      { docId: doc._id, data: formData },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Môn học (Bắt buộc)
        </label>
        {isLoadingSubjects ? (
          <p>Đang tải môn học...</p>
        ) : (
          <select
            required
            name="subject"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={formData.subject || ""}
            onChange={handleChange}
          >
            <option value="" disabled>
              -- Chọn môn học --
            </option>
            {allSubjects?.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Thể loại
          </label>
          <select
            name="documentType"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={formData.documentType || ""}
            onChange={handleChange}
          >
            <option value="">-- Chọn thể loại --</option>
            {documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Năm học
          </label>
          <select
            name="schoolYear"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={formData.schoolYear || ""}
            onChange={handleChange}
          >
            <option value="">-- Chọn năm học --</option>
            {schoolYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tiêu đề (Bắt buộc)
        </label>
        <input
          type="text"
          required
          name="title"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={formData.title || ""}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mô tả
        </label>
        <textarea
          name="description"
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          value={formData.description || ""}
          onChange={handleChange}
        />
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          onClick={onClose}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
        >
          {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </div>
    </form>
  );
}

export default function EditDocumentModal({
  isOpen,
  onClose,
  doc,
}: EditDocumentModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium leading-6 text-gray-900"
                >
                  Chỉnh sửa tài liệu
                </Dialog.Title>

                {doc && (
                  <EditDocumentForm
                    key={doc._id}
                    doc={doc}
                    onClose={onClose}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
