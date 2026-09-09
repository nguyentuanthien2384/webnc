"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { useMajors, useSubjects } from "@/hooks/useCategories";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSubjectIds: string[];
  setSelectedSubjectIds: (ids: string[]) => void;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  selectedSubjectIds,
  setSelectedSubjectIds,
}: FilterSidebarProps) {
  const { data: majors, isLoading: isLoadingMajors } = useMajors();
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjects();

  const [majorSearch, setMajorSearch] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");

  const [expandedMajors, setExpandedMajors] = useState<Set<string>>(new Set());

  const filteredMajors = useMemo(() => {
    if (!majors) return [];
    const filtered = majors.filter((major) =>
      major.name.toLowerCase().includes(majorSearch.toLowerCase()),
    );
    console.log(
      "🔍 [FilterSidebar] Total majors:",
      majors.length,
      "Filtered:",
      filtered.length,
    );
    return filtered;
  }, [majors, majorSearch]);

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(subjectSearch.toLowerCase()),
    );
  }, [subjects, subjectSearch]);

  useEffect(() => {
    console.log(
      "[FilterSidebar] selectedSubjectIds changed:",
      selectedSubjectIds,
    );
  }, [selectedSubjectIds]);

  const handleSubjectToggle = (subjectId: string | undefined) => {
    if (!subjectId) return;

    // ✅ Safe check for undefined/null
    const currentIds = selectedSubjectIds || [];
    const newIds = currentIds.includes(subjectId)
      ? currentIds.filter((id) => id !== subjectId)
      : [...currentIds, subjectId].sort();

    console.log("[SubjectToggle] ->", { subjectId, newIds });
    setSelectedSubjectIds(newIds);
  };

  // ✅ Toggle expand/collapse ngành
  const toggleMajorExpand = (majorId: string) => {
    const newExpanded = new Set(expandedMajors);
    if (newExpanded.has(majorId)) {
      newExpanded.delete(majorId);
    } else {
      newExpanded.add(majorId);
    }
    setExpandedMajors(newExpanded);
  };

  return (
    <aside
      className={`relative flex flex-col flex-shrink-0
        bg-white
        border-r border-gray-200
        transition-all duration-300 ${
          isOpen ? "w-72 p-4" : "w-0 p-0 overflow-hidden"
        }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* NGÀNH HỌC (Grouped Subjects) */}
      <div className="mt-4 flex flex-col min-h-0">
        <h4 className="font-normal text-gray-800 mb-2">Lọc theo ngành học</h4>
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Tìm ngành..."
            value={majorSearch}
            onChange={(e) => setMajorSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm"
          />
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
        </div>

        {/* ✅ FIX: Force scrollbar hiển thị với overflow-y-scroll và custom scrollbar */}
        <div
          className="border border-gray-200 rounded-md p-2"
          style={{
            height: "320px",
            overflowY: "scroll",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {isLoadingMajors ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : filteredMajors.length === 0 ? (
            <p className="text-sm text-gray-500">Không tìm thấy ngành</p>
          ) : (
            filteredMajors.map((major) => {
              const isExpanded = expandedMajors.has(major._id);
              const subjectsInMajor = major.subjects || [];

              return (
                <div key={major._id} className="mb-2">
                  {/* Header ngành */}
                  <button
                    onClick={() => toggleMajorExpand(major._id)}
                    className="w-full flex items-center justify-between py-1.5 px-2 hover:bg-gray-50 rounded text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="font-medium text-gray-800 text-sm">
                        {major.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({subjectsInMajor.length})
                    </span>
                  </button>

                  {/* Danh sách môn học trong ngành */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {subjectsInMajor.map((subject) => (
                        <label
                          key={subject._id ?? subject.name}
                          className="flex items-center py-1 cursor-pointer hover:bg-gray-50 px-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={
                              !!subject._id &&
                              Array.isArray(selectedSubjectIds) &&
                              selectedSubjectIds.includes(subject._id)
                            }
                            onChange={() =>
                              subject._id && handleSubjectToggle(subject._id)
                            }
                            className="mr-2 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {subject.name}
                          </span>
                        </label>
                      ))}
                      {subjectsInMajor.length === 0 && (
                        <p className="text-xs text-gray-400 italic px-2">
                          Chưa có môn học
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* TÌM KIẾM TẤT CẢ MÔN HỌC */}
      <div className="mt-6 border-t pt-4">
        <h4 className="font-normal text-gray-800 mb-2">Lọc theo môn học</h4>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm môn học..."
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm"
          />
          <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
        </div>
        <div className="h-48 overflow-y-auto mt-2 pr-2 border border-gray-100 rounded-md p-2">
          {isLoadingSubjects ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : filteredSubjects.length === 0 ? (
            <p className="text-sm text-gray-500">Không tìm thấy môn học</p>
          ) : (
            filteredSubjects.map((subject) => (
              <label
                key={subject._id ?? subject.name}
                className="flex items-center mt-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={
                    !!subject._id &&
                    Array.isArray(selectedSubjectIds) &&
                    selectedSubjectIds.includes(subject._id)
                  }
                  onChange={() =>
                    subject._id && handleSubjectToggle(subject._id)
                  }
                  className="mr-2 rounded"
                />
                <span className="text-sm text-gray-700">{subject.name}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
