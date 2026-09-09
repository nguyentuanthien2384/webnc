"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isEmailValid = email === "" || email.endsWith("@st.phenikaa-uni.edu.vn");
  const isPasswordLong = password.length >= 6;
  const doPasswordsMatch = confirmPassword === "" || password === confirmPassword;

  interface ApiErrorResponse {
    message?: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.endsWith("@st.phenikaa-uni.edu.vn")) {
      toast.error("Vui lòng sử dụng email sinh viên Phenikaa (@st.phenikaa-uni.edu.vn)");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", { email, fullName, password });
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        toast.error(error.response?.data?.message || "Đăng ký thất bại.");
      } else {
        toast.error("Đăng ký thất bại.");
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tạo tài khoản mới</h2>
        <p className="mt-2 text-sm text-gray-500">
          Tham gia cộng đồng chia sẻ tài liệu học tập Phenikaa
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              type="text"
              required
              className="block w-full pl-10 pr-3 py-2.5 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email sinh viên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={`block w-full pl-10 pr-10 py-2.5 text-gray-900 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                !isEmailValid
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="msv@st.phenikaa-uni.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {isEmailValid ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {!isEmailValid && (
            <p className="mt-1 text-xs text-red-500">
              Vui lòng sử dụng email @st.phenikaa-uni.edu.vn
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              className="block w-full pl-10 pr-10 py-2.5 text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {password && (
            <div className="mt-1.5 flex items-center gap-1">
              <div className={`h-1 flex-1 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-red-300"}`} />
              <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full ${password.length >= 10 ? "bg-green-500" : "bg-gray-200"}`} />
              <span className="text-xs text-gray-500 ml-2">
                {password.length < 6 ? "Yếu" : password.length < 8 ? "Trung bình" : "Mạnh"}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              required
              className={`block w-full pl-10 pr-10 py-2.5 text-gray-900 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition text-sm ${
                !doPasswordsMatch
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {doPasswordsMatch ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {!doPasswordsMatch && (
            <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isEmailValid || !isPasswordLong || !doPasswordsMatch}
          className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mt-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </span>
          ) : (
            "Đăng ký"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
}
