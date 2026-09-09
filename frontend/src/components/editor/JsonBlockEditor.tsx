"use client";

import { useEffect, useRef, useState } from "react";
import {
  ClipboardDocumentIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

type EditorOutput = {
  time?: number;
  blocks: Array<{ id?: string; type: string; data: Record<string, unknown> }>;
  version?: string;
};

type EditorInstance = {
  isReady: Promise<void>;
  save: () => Promise<EditorOutput>;
  destroy: () => void;
};

const DRAFT_KEY = "unishare-json-editor-draft";

const emptyData: EditorOutput = {
  blocks: [
    {
      type: "paragraph",
      data: { text: "Bắt đầu soạn nội dung của bạn tại đây…" },
    },
  ],
};

const getDraft = (): EditorOutput => {
  try {
    const stored = window.localStorage.getItem(DRAFT_KEY);
    if (!stored) return emptyData;
    const parsed = JSON.parse(stored) as EditorOutput;
    return Array.isArray(parsed.blocks) ? parsed : emptyData;
  } catch {
    return emptyData;
  }
};

export default function JsonBlockEditor() {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const [output, setOutput] = useState<EditorOutput>(emptyData);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isDisposed = false;

    const initializeEditor = async () => {
      const [{ default: EditorJS }, { default: Header }, { default: List }] =
        await Promise.all([
          import("@editorjs/editorjs"),
          import("@editorjs/header"),
          import("@editorjs/list"),
        ]);

      if (isDisposed || !holderRef.current) return;
      const initialData = getDraft();
      setOutput(initialData);

      const editor = new EditorJS({
        holder: holderRef.current,
        autofocus: true,
        placeholder: "Nhập nội dung tài liệu…",
        data: initialData,
        tools: {
          header: { class: Header, inlineToolbar: true },
          list: { class: List, inlineToolbar: true },
        },
        onChange: async () => {
          const data = await editorRef.current?.save();
          if (!data || isDisposed) return;
          setOutput(data);
          window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        },
      }) as unknown as EditorInstance;

      editorRef.current = editor;
      await editor.isReady;
      if (!isDisposed) setIsReady(true);
    };

    void initializeEditor().catch(() => {
      toast.error("Không thể khởi tạo trình soạn thảo.");
    });

    return () => {
      isDisposed = true;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  const json = JSON.stringify(output, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      toast.success("Đã sao chép JSON.");
    } catch {
      toast.error("Không thể sao chép JSON.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unishare-editor-content.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Đã tải file JSON.");
  };

  return (
    <main className="min-h-full flex-1 bg-gray-50 p-5 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Công cụ nội dung</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Soạn thảo và chuyển JSON
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Nội dung được tự động chuyển sang cấu trúc JSON khi bạn soạn thảo và lưu bản nháp trên thiết bị này.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!isReady}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              Sao chép JSON
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!isReady}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Tải JSON
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-700">
              <PencilSquareIcon className="h-5 w-5 text-blue-600" />
              Nội dung
            </div>
            <div className="min-h-[580px] p-5 sm:p-7">
              {!isReady && (
                <div className="mb-4 text-sm text-gray-500">Đang chuẩn bị trình soạn thảo…</div>
              )}
              <div ref={holderRef} className="editorjs-holder" />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-950 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-sm font-semibold text-white">JSON tự động tạo</h2>
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                {isReady ? "Đã đồng bộ" : "Đang tải"}
              </span>
            </div>
            <pre className="min-h-[580px] overflow-auto p-5 text-xs leading-6 text-slate-100 sm:p-7">
              <code>{json}</code>
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
