"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "react-hot-toast";

export default function ReportDocumentModal({ documentId, title, onClose }: {
  documentId: string; title: string; onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return <Dialog open onClose={() => { if (!pending) onClose(); }} className="relative z-[100]">
    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto p-4">
      <DialogPanel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <DialogTitle className="text-lg font-semibold text-gray-900">Báo cáo tài liệu</DialogTitle>
        <p className="mt-2 break-words text-sm text-gray-500">{title}</p>
        <form onSubmit={async (event) => {
          event.preventDefault();
          if (pending || reason.trim().length < 10) return;
          setPending(true); setError("");
          try {
            await api.post("/reports", { documentId, reason: reason.trim() });
            toast.success("Đã gửi báo cáo đến quản trị viên.");
            onClose();
          } catch (error) {
            setError(getApiErrorMessage(error, "Không thể gửi báo cáo."));
          } finally { setPending(false); }
        }}>
          <label htmlFor="report-reason" className="mt-5 block text-sm font-medium text-gray-700">Lý do báo cáo</label>
          <textarea id="report-reason" required minLength={10} maxLength={1000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm" placeholder="Mô tả nội dung không phù hợp, vi phạm bản quyền hoặc vấn đề khác…" />
          <p className="text-xs text-gray-500">Từ 10 đến 1.000 ký tự. Báo cáo sẽ được người quản lý xem xét.</p>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" disabled={pending} onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Hủy</button>
            <button type="submit" disabled={pending || reason.trim().length < 10} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">{pending ? "Đang gửi…" : "Gửi báo cáo"}</button>
          </div>
        </form>
      </DialogPanel>
    </div>
  </Dialog>;
}
