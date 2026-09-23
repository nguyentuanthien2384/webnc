"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadDocument } from "@/hooks/useUploadDocument";
import { UploadDocumentDto } from "@/@types/document.type";
import { getApiErrorMessage } from "@/lib/apiError";

type Result = { status: "waiting" | "uploading" | "success" | "error"; message?: string };

export default function UploadDoneStep({ files, metadata }: {
  files: File[];
  metadata: Partial<UploadDocumentDto>[];
}) {
  const { mutateAsync } = useUploadDocument();
  const queryClient = useQueryClient();
  const [started, setStarted] = useState(false);
  const busy = useRef(false);
  const [results, setResults] = useState<Result[]>(() => files.map(() => ({ status: "waiting" })));

  const upload = useCallback(async (indices: number[]) => {
    if (busy.current) return;
    busy.current = true;
    setStarted(true);
    setResults((old) => old.map((result, index) => indices.includes(index) ? { status: "uploading" } : result));
    // Process sequentially to avoid loading many 100 MB files into memory at once.
    for (const index of indices) {
      let result: Result;
      try {
        await mutateAsync({ file: files[index], metadata: metadata[index] });
        result = { status: "success" };
      } catch (error) {
        result = { status: "error", message: getApiErrorMessage(error, "Không thể tải lên tệp.") };
      }
      setResults((old) => old.map((entry, i) => i === index ? result : entry));
    }
    busy.current = false;
    for (const key of ["documents", "myDocuments", "myProfile", "myStats", "userDocuments", "userStats", "platformStats"]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  }, [files, metadata, mutateAsync, queryClient]);

  const pending = results.some((entry) => entry.status === "uploading");
  const failed = results.flatMap((entry, index) => entry.status === "error" ? [index] : []);
  const succeeded = results.filter((entry) => entry.status === "success").length;

  return (
    <div aria-live="polite">
      <h2 className="text-xl font-semibold text-gray-900">{!started ? "Sẵn sàng tải lên" : pending ? "Đang tải lên tài liệu…" : "Kết quả tải lên"}</h2>
      <p className="mt-2 text-sm text-gray-500">{succeeded}/{files.length} tệp đã tải lên thành công. {pending && "Vui lòng giữ trang này mở."}</p>
      <ul className="my-6 space-y-3">
        {files.map((file, index) => (
          <li key={index} className="rounded-xl border border-gray-200 p-3">
            <p className="break-all font-medium text-gray-800">{file.name}</p>
            <p className={`mt-1 text-sm ${results[index].status === "error" ? "text-red-600" : "text-gray-500"}`}>
              {({ waiting: "Đang chờ", uploading: "Đang tải lên…", success: "Đã tải lên", error: results[index].message })[results[index].status]}
            </p>
          </li>
        ))}
      </ul>
      {!pending && <div className="flex flex-wrap gap-3">
        {!started && <button type="button" disabled={files.length === 0} onClick={() => void upload(files.map((_, index) => index))} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Bắt đầu tải lên</button>}
        {failed.length > 0 && <button type="button" onClick={() => {
          setResults((old) => old.map((result, index) => failed.includes(index) ? { status: "uploading" } : result));
          void upload(failed);
        }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Thử lại {failed.length} tệp lỗi</button>}
        <Link href="/profile/me" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">Xem tài liệu của tôi</Link>
        <Link href="/" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">Về kho tài liệu</Link>
      </div>}
    </div>
  );
}
