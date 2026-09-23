"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowTopRightOnSquareIcon,
  DocumentIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

type DocumentPreviewProps = {
  documentId: string;
  fileType?: string;
};

export const getDocumentPreviewUrl = (documentId: string) =>
  `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}/preview`;

const isPdf = (fileType?: string) => fileType?.toLowerCase().includes("pdf");
const isDocx = (fileType?: string) =>
  fileType?.toLowerCase().includes("wordprocessingml.document") ||
  fileType?.toLowerCase().includes("docx");

const PdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center bg-gray-100 text-sm text-gray-500">
      Đang tải trình xem PDF…
    </div>
  ),
});

export default function DocumentPreview({
  documentId,
  fileType,
}: DocumentPreviewProps) {
  const previewUrl = getDocumentPreviewUrl(documentId);
  const docxContentRef = useRef<HTMLDivElement>(null);
  const docxStyleRef = useRef<HTMLDivElement>(null);
  const [docxStatus, setDocxStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!isDocx(fileType)) return;

    let cancelled = false;
    const contentNode = docxContentRef.current;
    const styleNode = docxStyleRef.current;

    const renderDocument = async () => {
      try {
        setDocxStatus("loading");
        const response = await fetch(previewUrl);
        if (!response.ok) throw new Error("Unable to retrieve the document");

        const [file, { renderAsync }] = await Promise.all([
          response.arrayBuffer(),
          import("docx-preview"),
        ]);

        if (cancelled || !contentNode || !styleNode) return;
        contentNode.replaceChildren();
        styleNode.replaceChildren();
        await renderAsync(file, contentNode, styleNode, {
          breakPages: true,
          inWrapper: true,
        });
        if (!cancelled) setDocxStatus("ready");
      } catch {
        if (!cancelled) setDocxStatus("error");
      }
    };

    void renderDocument();
    return () => {
      cancelled = true;
      contentNode?.replaceChildren();
      styleNode?.replaceChildren();
    };
  }, [fileType, previewUrl]);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <EyeIcon className="h-5 w-5 text-blue-500" />
          Xem trước tài liệu
        </h3>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Mở trong tab mới
          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      </div>

      {isPdf(fileType) ? (
        <PdfPreview key={documentId} url={previewUrl} />
      ) : isDocx(fileType) ? (
        <div className="min-h-[360px] bg-gray-100 p-4 sm:p-6">
          {docxStatus === "loading" && (
            <div className="flex h-72 items-center justify-center text-sm text-gray-500">
              Đang tải nội dung tài liệu…
            </div>
          )}
          {docxStatus === "error" && (
            <div className="flex h-72 flex-col items-center justify-center px-6 text-center">
              <DocumentIcon className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm text-gray-600">
                Không thể hiển thị tài liệu này ngay trong trang.
              </p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm font-medium text-blue-600 hover:underline"
              >
                Mở tệp trong tab mới
              </a>
            </div>
          )}
          <div ref={docxStyleRef} />
          <div
            ref={docxContentRef}
            className={docxStatus === "ready" ? "docx-preview-content" : "hidden"}
          />
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <DocumentIcon className="mb-4 h-16 w-16 text-gray-300" />
          <h4 className="font-semibold text-gray-700">Định dạng này chưa có trình xem trực tiếp</h4>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Bạn vẫn có thể mở tệp trong tab mới hoặc tải xuống để xem bằng ứng dụng phù hợp.
          </p>
        </div>
      )}
    </section>
  );
}
