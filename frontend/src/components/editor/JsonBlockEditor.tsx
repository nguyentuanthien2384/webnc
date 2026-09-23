"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ClipboardDocumentIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import api from "@/lib/axios";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { useAuthStore } from "@/store/auth.store";

type EditorOutput = {
  time?: number;
  blocks: Array<{ id?: string; type: string; data: Record<string, unknown> }>;
  version?: string;
};
type EditorInstance = {
  isReady: Promise<void>;
  save: () => Promise<EditorOutput>;
  render: (data: EditorOutput) => Promise<void>;
  destroy: () => void;
};
type Draft = {
  _id: string;
  title: string;
  content: EditorOutput;
  version: number;
  sourceDocument?: string;
  updatedAt: string;
};
type DraftSummary = Omit<Draft, "content">;

const emptyData: EditorOutput = {
  blocks: [{ type: "paragraph", data: { text: "Bắt đầu soạn nội dung của bạn tại đây…" } }],
};
const draftKey = (userId: string) => `unishare-json-editor-draft-${userId}`;
const getLocalDraft = (userId: string): EditorOutput => {
  try {
    const stored = window.localStorage.getItem(draftKey(userId));
    if (!stored) return emptyData;
    const parsed = JSON.parse(stored) as EditorOutput;
    return Array.isArray(parsed.blocks) ? parsed : emptyData;
  } catch {
    return emptyData;
  }
};

export default function JsonBlockEditor() {
  const userId = useAuthStore((state) => state.user?._id ?? "guest");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorInstance | null>(null);
  const [output, setOutput] = useState<EditorOutput>(emptyData);
  const [isReady, setIsReady] = useState(false);
  const [title, setTitle] = useState("Bản nháp mới");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftVersion, setDraftVersion] = useState(0);
  const [sourceDocumentId, setSourceDocumentId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [draftPage, setDraftPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [saving, setSaving] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);

  const refreshDrafts = useCallback(async (page: number) => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get("/editor/drafts", { params: { page } });
      setDrafts(response.data.data);
      setDraftPage(page);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải danh sách bản nháp."));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let disposed = false;
    const initialize = async () => {
      const [{ default: EditorJS }, { default: Header }, { default: List }] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
      ]);
      if (disposed || !holderRef.current) return;
      const initialData = getLocalDraft(userId);
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
          if (!data || disposed) return;
          setOutput(data);
          window.localStorage.setItem(draftKey(userId), JSON.stringify(data));
        },
      }) as unknown as EditorInstance;
      editorRef.current = editor;
      await editor.isReady;
      if (!disposed) setIsReady(true);
    };
    void initialize().catch(() => toast.error("Không thể khởi tạo trình soạn thảo."));
    return () => {
      disposed = true;
      setIsReady(false);
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) void refreshDrafts(1);
  }, [isAuthenticated, refreshDrafts]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) return;
    const documentId = new URLSearchParams(window.location.search).get("documentId");
    if (!documentId) return;
    void api.get(`/editor/drafts/for-document/${documentId}`).then(async (response) => {
      const draft = response.data as Draft;
      const local = getLocalDraft(userId);
      if (JSON.stringify(local.blocks) !== JSON.stringify(emptyData.blocks) &&
          !window.confirm("Mở ghi chú đã lưu? Nội dung đang soạn trên thiết bị có thể bị thay thế.")) return;
      await editorRef.current?.render(draft.content);
      setOutput(draft.content);
      setTitle(draft.title);
      setDraftId(draft._id);
      setDraftVersion(draft.version);
      setSourceDocumentId(documentId);
      setHasConflict(false);
      window.localStorage.setItem(draftKey(userId), JSON.stringify(draft.content));
    }).catch((error) => {
      if (getApiErrorStatus(error) === 404) setSourceDocumentId(documentId);
      else toast.error(getApiErrorMessage(error, "Không thể tải ghi chú."));
    });
  }, [isReady, isAuthenticated, userId]);

  const loadDraft = async (id: string) => {
    if (draftId !== id && !window.confirm("Mở bản nháp này? Nội dung đang soạn nhưng chưa lưu vào tài khoản có thể bị thay thế.")) return;
    try {
      const response = await api.get(`/editor/drafts/${id}`);
      const draft = response.data as Draft;
      await editorRef.current?.render(draft.content);
      setOutput(draft.content);
      setTitle(draft.title);
      setDraftId(draft._id);
      setDraftVersion(draft.version);
      setSourceDocumentId(draft.sourceDocument ?? null);
      setHasConflict(false);
      window.localStorage.setItem(draftKey(userId), JSON.stringify(draft.content));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể mở bản nháp."));
    }
  };

  const saveDraft = async () => {
    if (!isAuthenticated || !editorRef.current || saving) return;
    if (!title.trim()) { toast.error("Vui lòng nhập tên bản nháp."); return; }
    setSaving(true);
    try {
      const content = await editorRef.current.save();
      const response = draftId
        ? await api.patch(`/editor/drafts/${draftId}`, { title: title.trim(), content, version: draftVersion })
        : await api.post("/editor/drafts", {
          title: title.trim(), content,
          ...(sourceDocumentId && { sourceDocumentId }),
        });
      const saved = response.data as Draft;
      setDraftId(saved._id);
      setDraftVersion(saved.version);
      setOutput(content);
      setHasConflict(false);
      await refreshDrafts(1);
      toast.success("Đã lưu bản nháp vào tài khoản.");
    } catch (error) {
      if (draftId && getApiErrorStatus(error) === 409) setHasConflict(true);
      toast.error(getApiErrorMessage(error, "Không thể lưu bản nháp."));
    } finally { setSaving(false); }
  };

  const saveCopy = async () => {
    if (!isAuthenticated || !editorRef.current || saving) return;
    setSaving(true);
    try {
      const content = await editorRef.current.save();
      const suffix = " (bản sao)";
      const copyTitle = `${(title.trim() || "Bản nháp").slice(0, 120 - suffix.length)}${suffix}`;
      const response = await api.post("/editor/drafts", { title: copyTitle, content });
      const saved = response.data as Draft;
      setTitle(saved.title);
      setDraftId(saved._id);
      setDraftVersion(saved.version);
      setSourceDocumentId(null);
      setOutput(content);
      setHasConflict(false);
      await refreshDrafts(1);
      toast.success("Đã lưu nội dung hiện tại thành bản sao mới.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể lưu bản sao."));
    } finally { setSaving(false); }
  };

  const newDraft = async () => {
    if (!window.confirm("Tạo bản nháp mới? Hãy lưu bản hiện tại nếu bạn muốn giữ nội dung trên tài khoản.")) return;
    await editorRef.current?.render(emptyData);
    setOutput(emptyData);
    setTitle("Bản nháp mới");
    setDraftId(null);
    setDraftVersion(0);
    setSourceDocumentId(null);
    setHasConflict(false);
    window.localStorage.setItem(draftKey(userId), JSON.stringify(emptyData));
  };

  const deleteDraft = async () => {
    if (!draftId || !window.confirm("Xóa vĩnh viễn bản nháp này khỏi tài khoản?")) return;
    try {
      await api.delete(`/editor/drafts/${draftId}`);
      await editorRef.current?.render(emptyData);
      setOutput(emptyData);
      setTitle("Bản nháp mới");
      setDraftId(null);
      setDraftVersion(0);
      setSourceDocumentId(null);
      setHasConflict(false);
      window.localStorage.setItem(draftKey(userId), JSON.stringify(emptyData));
      await refreshDrafts(1);
      toast.success("Đã xóa bản nháp.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể xóa bản nháp."));
    }
  };

  const json = JSON.stringify(output, null, 2);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(json); toast.success("Đã sao chép JSON."); }
    catch { toast.error("Không thể sao chép JSON."); }
  };
  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "unishare-editor-content.json";
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
    toast.success("Đã tải file JSON.");
  };

  return <main className="min-h-full flex-1 bg-gray-50 p-5 sm:p-6 lg:p-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Công cụ nội dung</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Soạn thảo và chuyển JSON</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">Nội dung tự lưu trên thiết bị. Chọn “Lưu vào tài khoản” để đồng bộ bản nháp trên máy chủ.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleCopy} disabled={!isReady} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50"><ClipboardDocumentIcon className="h-4 w-4" />Sao chép JSON</button>
          <button type="button" onClick={handleDownload} disabled={!isReady} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50"><DocumentArrowDownIcon className="h-4 w-4" />Tải JSON</button>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="draft-title" className="mb-1 block text-sm font-medium text-gray-700">Tên bản nháp</label>
            <input id="draft-title" value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900" />
          </div>
          <button type="button" onClick={() => void saveDraft()} disabled={!isAuthenticated || !isReady || saving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu…" : "Lưu vào tài khoản"}</button>
          <button type="button" onClick={() => void newDraft()} disabled={!isReady} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50">Bản nháp mới</button>
          {draftId && <button type="button" onClick={() => void deleteDraft()} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">Xóa bản nháp</button>}
        </div>
        {sourceDocumentId && <p className="mt-3 text-sm text-gray-600">Ghi chú riêng cho <Link href={`/document/${sourceDocumentId}`} className="font-medium text-blue-600 hover:underline">tài liệu này</Link>.</p>}
        {hasConflict && <div role="alert" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><p>Bản nháp đã được sửa ở nơi khác. Nội dung trên thiết bị này vẫn còn; bạn có thể lưu thành bản sao riêng.</p><button type="button" onClick={() => void saveCopy()} disabled={saving} className="mt-2 rounded-lg bg-amber-700 px-3 py-2 font-semibold text-white disabled:opacity-50">Lưu thành bản sao</button></div>}
        {!isAuthenticated && <p className="mt-3 text-sm text-amber-700"><Link href="/login" className="font-semibold underline">Đăng nhập</Link> để lưu bản nháp vào tài khoản. Nội dung hiện chỉ nằm trên thiết bị này.</p>}
      </section>

      {isAuthenticated && <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Bản nháp đã lưu</h2>
        {drafts.length === 0 ? <p className="text-sm text-gray-500">Chưa có bản nháp trên tài khoản.</p> : <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{drafts.map((draft) => <li key={draft._id}><button type="button" onClick={() => void loadDraft(draft._id)} className={`w-full rounded-xl border p-3 text-left text-sm hover:border-blue-400 ${draftId === draft._id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}><span className="block font-semibold text-gray-800">{draft.title}</span><span className="mt-1 block text-xs text-gray-500">{new Date(draft.updatedAt).toLocaleString("vi-VN")}{draft.sourceDocument && " · Gắn với tài liệu"}</span></button></li>)}</ul>}
        {totalPages > 1 && <div className="mt-3 flex items-center gap-3 text-sm"><button type="button" disabled={draftPage <= 1} onClick={() => void refreshDrafts(draftPage - 1)} className="disabled:opacity-40">Trước</button><span>Trang {draftPage}/{totalPages}</span><button type="button" disabled={draftPage >= totalPages} onClick={() => void refreshDrafts(draftPage + 1)} className="disabled:opacity-40">Sau</button></div>}
      </section>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4 text-sm font-semibold text-gray-700"><PencilSquareIcon className="h-5 w-5 text-blue-600" />Nội dung</div>
          <div className="min-h-[580px] p-5 sm:p-7">{!isReady && <div className="mb-4 text-sm text-gray-500">Đang chuẩn bị trình soạn thảo…</div>}<div ref={holderRef} className="editorjs-holder" /></div>
        </section>
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-950 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">JSON tự động tạo</h2><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-medium text-emerald-300">{isReady ? "JSON cập nhật" : "Đang tải"}</span></div>
          <pre className="min-h-[580px] overflow-auto p-5 text-xs leading-6 text-slate-100 sm:p-7"><code>{json}</code></pre>
        </section>
      </div>
    </div>
  </main>;
}
