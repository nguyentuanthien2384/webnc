"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@heroicons/react/24/outline";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Keep the worker version paired with the pdfjs-dist version used by react-pdf.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

type PdfPreviewProps = {
  url: string;
};

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;

export default function PdfPreview({ url }: PdfPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const errorMessage = (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
      <DocumentIcon className="mb-3 h-12 w-12 text-gray-300" />
      <p className="text-sm text-gray-600">Không thể hiển thị tệp PDF này.</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-sm font-medium text-blue-600 hover:underline"
      >
        Mở tệp trong tab mới
      </a>
    </div>
  );

  return (
    <div className="bg-gray-100">
      <div className="flex flex-wrap items-center justify-center gap-3 border-b border-gray-200 bg-white px-4 py-3 text-sm sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Trang trước"
            title="Trang trước"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="min-w-24 text-center text-gray-700">
            {hasError ? "Không tải được PDF" : numPages ? `Trang ${pageNumber} / ${numPages}` : "Đang tải PDF…"}
          </span>
          <button
            type="button"
            aria-label="Trang sau"
            title="Trang sau"
            disabled={!numPages || pageNumber >= numPages}
            onClick={() => setPageNumber((page) => Math.min(numPages, page + 1))}
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Thu nhỏ"
            title="Thu nhỏ"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </button>
          <span className="min-w-12 text-center text-gray-700">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            aria-label="Phóng to"
            title="Phóng to"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
            className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="max-h-[75vh] min-h-[360px] overflow-auto p-4 sm:max-h-[800px]">
        <Document
          file={url}
          suspense={false}
          loading={<div className="py-24 text-center text-sm text-gray-500">Đang tải PDF…</div>}
          error={errorMessage}
          onLoadError={() => setHasError(true)}
          onLoadSuccess={({ numPages: total }) => {
            setHasError(false);
            setNumPages(total);
            setPageNumber(1);
          }}
          className="flex min-w-max justify-center"
        >
          {containerWidth > 0 && (
            <Page
              pageNumber={pageNumber}
              width={Math.round(Math.min(Math.max(containerWidth - 32, 240), 900) * zoom)}
              loading={<div className="py-24 text-center text-sm text-gray-500">Đang hiển thị trang…</div>}
              error={errorMessage}
              className="shadow-md"
            />
          )}
        </Document>
      </div>
    </div>
  );
}
