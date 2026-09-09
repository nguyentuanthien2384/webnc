// src/@types/document.type.ts
export interface Uploader {
  _id: string;
  fullName: string;
  avatarUrl?: string;
}

// --- Kiểu dữ liệu (Types) ---

// Kiểu dữ liệu cho Môn học (Subject)
// Đây là đối tượng được "populate" (tra cứu) từ backend
export interface Subject {
  _id: string;
  name: string;
  code: string;
}

// --- GIAO DIỆN DOCUMENT CHÍNH (ĐÃ CẬP NHẬT) ---
export interface Document {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploader: Uploader; // <-- Là một Object
  status: "PROCESSING" | "VISIBLE" | "BLOCKED";

  // --- THAY ĐỔI QUAN TRỌNG ---
  // faculty: string; // <-- Trường này đã bị BỎ
  subject: Subject; // <-- Đổi từ string sang Object
  // --- KẾT THÚC ---

  documentType: string;
  schoolYear: string;
  thumbnailUrl?: string;
  downloadCount: number;
  viewCount: number;
  uploadDate: string; // (Date sẽ được trả về dưới dạng string)
}

// DTO này được dùng cho trang Upload
export interface UploadDocumentDto {
  title: string;
  description: string;
  subject: string; // Đây là ID (string) khi gửi đi
  documentType: string;
  schoolYear: string;
}
