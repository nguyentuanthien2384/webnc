"use client";
import { UploadDocumentDto } from "@/@types/document.type";
// --- IMPORT MỚI ---
import { useSubjects } from "@/hooks/useCategories";
// --- KẾT THÚC ---

interface FileDetailsStepProps {
  files: File[];
  metadata: Partial<UploadDocumentDto>[];
  setMetadata: React.Dispatch<
    React.SetStateAction<Partial<UploadDocumentDto>[]>
  >;
  onSubmit: () => void; // Hàm để chuyển sang Bước 3
}

// Dữ liệu giả cho các dropdown còn lại (dựa trên ảnh 319f6a.png)
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

export default function FileDetailsStep({
  files,
  metadata,
  setMetadata,
  onSubmit,
}: FileDetailsStepProps) {
  // --- LẤY DỮ LIỆU THẬT ---
  const { data: allSubjects, isLoading: isLoadingSubjects } = useSubjects();
  // --- KẾT THÚC ---

  // Hàm cập nhật metadata cho một file cụ thể
  const handleMetadataChange = (
    index: number,
    field: keyof UploadDocumentDto,
    value: string,
  ) => {
    const newMetadata = [...metadata];
    newMetadata[index] = {
      ...newMetadata[index],
      [field]: value,
    };
    setMetadata(newMetadata);
  };

  return (
    <div>
      {files.map((file, index) => (
        <div key={index} className="p-4 mb-4 border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">{file.name}</h3>

          {/* Hàng 1: Môn học (Subject) - Dữ liệu động */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Môn học (Bắt buộc)
            </label>
            {isLoadingSubjects ? (
              <p>Đang tải môn học...</p>
            ) : (
              <select
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                value={metadata[index]?.subject || ""}
                onChange={(e) =>
                  handleMetadataChange(index, "subject", e.target.value)
                }
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

          {/* Hàng 2: Các dropdown phụ */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thể loại
              </label>
              <select
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                value={metadata[index]?.documentType || ""}
                onChange={(e) =>
                  handleMetadataChange(index, "documentType", e.target.value)
                }
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                value={metadata[index]?.schoolYear || ""}
                onChange={(e) =>
                  handleMetadataChange(index, "schoolYear", e.target.value)
                }
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

          {/* Hàng 3: Title */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Tiêu đề (Bắt buộc)
            </label>
            <input
              type="text"
              required
              placeholder="Tiêu đề tài liệu..."
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              value={metadata[index]?.title || ""}
              onChange={(e) =>
                handleMetadataChange(index, "title", e.target.value)
              }
            />
          </div>

          {/* Hàng 4: Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              placeholder="Mô tả ngắn..."
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              value={metadata[index]?.description || ""}
              onChange={(e) =>
                handleMetadataChange(index, "description", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        onClick={onSubmit}
        className="w-full p-3 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        Tiếp tục (Next)
      </button>
    </div>
  );
}
