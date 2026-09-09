"use client";
import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentCard from "@/components/documents/DocumentCard";
import {
  Squares2X2Icon,
  QueueListIcon,
  AdjustmentsHorizontalIcon,
  DocumentIcon,
} from "@heroicons/react/24/solid";
import SortDropdown, { SortOption } from "@/components/common/SortDropdown";
import FilterSidebar from "@/components/layout/FilterSidebar";
import { useSearchStore } from "@/store/search.store";

type ViewMode = "grid" | "list";

const sortByOptions: SortOption[] = [
  { label: "Ngày đăng (Mới nhất)", value: "uploadDate" },
  { label: "Lượt tải (Nhiều nhất)", value: "downloads" },
];

const sortOrderOptions: SortOption[] = [
  { label: "Giảm dần", value: "desc" },
  { label: "Tăng dần", value: "asc" },
];

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>(sortByOptions[0]);
  const [sortOrder, setSortOrder] = useState<SortOption>(sortOrderOptions[0]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const search = useSearchStore((state) => state.search);

  const { data, isLoading, isError, isFetching } = useDocuments(
    sortBy.value,
    sortOrder.value,
    selectedSubjectIds,
    search,
  );

  if (isLoading) {
    return (
      <main className="flex-1 p-6 bg-gray-50">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex-1 p-6 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Lỗi khi tải tài liệu
          </h2>
          <p className="mt-1 text-sm text-gray-500">Vui lòng thử lại sau</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <FilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedSubjectIds={selectedSubjectIds}
        setSelectedSubjectIds={setSelectedSubjectIds}
      />

      <main className="flex-1 p-6 relative bg-gray-50 transition-all duration-300">
        {isFetching && (
          <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Đang cập nhật...
          </div>
        )}

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {search ? `Kết quả cho "${search}"` : "Tất cả tài liệu"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.pagination.total || 0} tài liệu
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SortDropdown
              label="Sắp xếp"
              options={sortByOptions}
              value={sortBy}
              onChange={setSortBy}
            />
            <SortDropdown
              label="Thứ tự"
              options={sortOrderOptions}
              value={sortOrder}
              onChange={setSortOrder}
            />
            <div className="flex p-0.5 bg-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
              >
                <Squares2X2Icon className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
              >
                <QueueListIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`transition-opacity ${isFetching ? "opacity-50" : "opacity-100"}`}
        >
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-3"
            }
          >
            {data?.data.map((doc) => (
              <DocumentCard key={doc._id} doc={doc} viewMode={viewMode} />
            ))}
            {data?.data.length === 0 && (
              <div className="col-span-full text-center py-16">
                <DocumentIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  Không tìm thấy tài liệu nào
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
