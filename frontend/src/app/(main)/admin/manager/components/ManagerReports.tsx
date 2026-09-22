"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";
import Pagination from "@/components/common/Pagination";
import { toast } from "react-hot-toast";

interface Report {
  _id: string;
  document: { _id: string; title: string; status: string } | null;
  reporter: { fullName: string; email: string } | null;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}
const statuses = { OPEN: "Đang chờ", RESOLVED: "Đã xử lý", DISMISSED: "Đã bác bỏ" };

export default function ManagerReports() {
  const [status, setStatus] = useState("OPEN");
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery<{ data: Report[]; pagination: { total: number; totalPages: number } }>({
    queryKey: ["reports", status, page],
    queryFn: async () => (await api.get("/reports", { params: { status: status || undefined, page } })).data,
  });
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => api.patch(`/reports/${id}`, { status }),
    onSuccess: () => {
      toast.success("Đã cập nhật báo cáo");
      setPage(1);
      void client.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Không thể xử lý báo cáo")),
  });

  return <section>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Báo cáo tài liệu ({data?.pagination.total ?? 0})</h2>
      <select aria-label="Trạng thái báo cáo" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 p-2 text-sm">
        <option value="">Tất cả trạng thái</option>
        {Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    <p className="mb-4 text-sm text-gray-500">Kiểm tra nội dung và khóa tài liệu tại mục Tài liệu nếu cần, sau đó đánh dấu báo cáo đã xử lý.</p>
    {isLoading && <p>Đang tải báo cáo…</p>}
    {isError && <p role="alert" className="text-red-600">Không thể tải báo cáo. <button onClick={() => void refetch()} className="underline">Thử lại</button></p>}
    {!isLoading && !isError && data?.data.length === 0 && <p className="py-8 text-center text-gray-500">Không có báo cáo trong mục này.</p>}
    <div className="space-y-4">
      {data?.data.map((report) => <article key={report._id} className="rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap justify-between gap-2">
          {report.document?.status === "VISIBLE" ? <Link className="font-semibold text-blue-600 hover:underline" href={`/document/${report.document._id}`}>{report.document.title}</Link> : <h3 className="font-semibold">{report.document?.title ?? "Tài liệu đã bị xóa"}{report.document && " (đã khóa)"}</h3>}
          <span className="text-xs text-gray-500">{statuses[report.status]}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-800">{report.reason}</p>
        <p className="mt-2 text-xs text-gray-500">{report.reporter?.fullName ?? "Tài khoản đã bị xóa"} · {new Date(report.createdAt).toLocaleString("vi-VN")}</p>
        {report.status === "OPEN" && <div className="mt-4 flex gap-3">
          <button disabled={update.isPending} onClick={() => update.mutate({ id: report._id, status: "RESOLVED" })} className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50">Đánh dấu đã xử lý</button>
          <button disabled={update.isPending} onClick={() => update.mutate({ id: report._id, status: "DISMISSED" })} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Bác bỏ báo cáo</button>
        </div>}
      </article>)}
    </div>
    <Pagination page={page} totalPages={data?.pagination.totalPages ?? 0} onPageChange={setPage} />
  </section>;
}
