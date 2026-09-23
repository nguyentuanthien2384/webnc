"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/apiError";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return <>
    <h1 className="text-2xl font-bold text-gray-900">Khôi phục mật khẩu</h1>
    <p className="mt-2 text-sm text-gray-600">Nhập email tài khoản. Nếu hợp lệ, liên kết đặt lại mật khẩu sẽ được gửi và có hiệu lực trong 15 phút.</p>
    <form className="mt-6 space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setLoading(true); setError(""); setMessage("");
      try {
        const result = await api.post("/auth/forgot-password", { email: email.trim() });
        setMessage(result.data.message);
      } catch (err) {
        setError(getApiErrorMessage(err, "Không thể gửi yêu cầu. Vui lòng thử lại."));
      } finally { setLoading(false); }
    }}>
      <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700">Email</label>
      <input id="recovery-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900" placeholder="email@st.phenikaa-uni.edu.vn" />
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Đang gửi…" : "Gửi liên kết"}</button>
    </form>
    {message && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Link href="/login" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">Quay lại đăng nhập</Link>
  </>;
}
