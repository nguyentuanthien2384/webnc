"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const lastPage = Math.min(totalPages, firstPage + 4);
  const pages = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index,
  );

  return (
    <nav
      aria-label="Phân trang tài liệu"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {firstPage > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            1
          </button>
          <span className="px-1 text-gray-400">…</span>
        </>
      )}

      {pages.map((pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
            pageNumber === page
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      {lastPage < totalPages && (
        <>
          <span className="px-1 text-gray-400">…</span>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
