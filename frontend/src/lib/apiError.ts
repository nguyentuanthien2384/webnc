// src/lib/apiError.ts
import axios from "axios";

/**
 * Body lỗi chuẩn của NestJS. `message` là mảng khi ValidationPipe trả về
 * nhiều lỗi field cùng lúc, là string với các exception thông thường.
 */
interface ApiErrorBody {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

/** HTTP status của lỗi axios, undefined nếu request không tới được server. */
export function getApiErrorStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}

/**
 * Message do server trả về, đã gộp mảng validation thành một dòng.
 * Trả về undefined nếu response không có message (lỗi mạng, 500 trống...).
 */
export function getServerErrorMessage(err: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorBody>(err)) return undefined;

  const message = err.response?.data?.message;

  if (Array.isArray(message) && message.length > 0) return message[0];
  if (typeof message === "string" && message) return message;

  return undefined;
}

/** Lấy message hiển thị được cho người dùng từ một lỗi bất kỳ. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const serverMessage = getServerErrorMessage(err);
  if (serverMessage) return serverMessage;

  if (err instanceof Error && err.message) return err.message;

  return fallback;
}
