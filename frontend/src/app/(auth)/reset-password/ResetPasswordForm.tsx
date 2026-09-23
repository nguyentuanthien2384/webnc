"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  return <>
    <h1 className="text-2xl font-bold text-gray-900">Đặt mật khẩu mới</h1>
    {!token ? <p role="alert" className="mt-4 text-sm text-red-700">Liên kết không hợp lệ. Hãy yêu cầu email mới.</p> : done ? (
      <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">Đã đổi mật khẩu thành công. Tất cả phiên đăng nhập cũ đã hết hiệu lực.</p>
    ) : <form className="mt-6 space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      if (password !== confirmation) { setError("Mật khẩu nhập lại không khớp."); return; }
      setLoading(true); setError("");
      try {
        await api.post("/auth/reset-password", { token, newPassword: password });
        setDone(true);
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể đặt lại mật khẩu."));
      } finally { setLoading(false); }
    }}>
      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
      <input id="new-password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900" />
      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
      <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900" />
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Đang lưu…" : "Đặt lại mật khẩu"}</button>
    </form>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Link href={done ? "/login" : "/forgot-password"} className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">{done ? "Đăng nhập" : "Yêu cầu liên kết mới"}</Link>
  </>;
}
