/**
 * UniShare — TOÀN BỘ DATABASE TRONG MỘT FILE
 *
 * 6 collection, 84 document. Không cần thư mục dump/, không cần
 * MongoDB Database Tools (mongoimport/mongorestore).
 *
 * CÁCH 1 — bằng Node (khuyến nghị, chắc chắn chạy được):
 *     cd backend
 *     node database/unishare-full-db.js
 *     node database/unishare-full-db.js "mongodb://127.0.0.1:27017/ten_db_khac"
 *
 * CÁCH 2 — bằng mongosh, hoặc cửa sổ MONGOSH ở đáy MongoDB Compass:
 *     load("D:/webnc/backend/database/unishare-full-db.js")
 *
 * File LUÔN xoá sạch 6 collection này rồi nạp lại từ đầu.
 *
 * Đăng nhập: admin@unishare.com / admin123
 *
 * SINH TỰ ĐỘNG bởi database/export-db.js — đừng sửa tay, hãy chạy: npm run db:export
 */
/* eslint-disable */

(function () {
  var inShell =
    typeof db !== 'undefined' && db && typeof db.getSiblingDB === 'function';

  var OID, DT;
  if (inShell) {
    OID = function (s) { return new ObjectId(s); };
    DT = function (s) { return new Date(s); };
  } else {
    OID = function (s) { return new (require('mongodb').ObjectId)(s); };
    DT = function (s) { return new Date(s); };
  }

  var DATA = {
    documents: [
      {
        _id: OID("6a7832bf06aef7954aabe7e0"),
        title: "Slide bài giảng Nhập môn lập trình - Chương 1",
        description: "Giới thiệu về lập trình C/C++",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207285-996907.pdf",
        filePath: "uploads/seed-1786262207285-996907.pdf",
        fileType: "application/pdf",
        fileSize: 449,
        uploader: OID("6a7832bf06aef7954aabe7c3"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7c9"),
        documentType: "Lecture Notes",
        schoolYear: "2024-2025",
        downloadCount: 15,
        viewCount: 42,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207285-996907.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e1"),
        title: "Đề thi giữa kỳ Cấu trúc dữ liệu 2024",
        description: "Đề thi giữa kỳ kèm đáp án chi tiết",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207285-993647.pdf",
        filePath: "uploads/seed-1786262207285-993647.pdf",
        fileType: "application/pdf",
        fileSize: 443,
        uploader: OID("6a7832bf06aef7954aabe7c4"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7ca"),
        documentType: "Exam Paper",
        schoolYear: "2024-2025",
        downloadCount: 89,
        viewCount: 200,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207285-993647.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e2"),
        title: "Tổng hợp lý thuyết Cơ sở dữ liệu",
        description: "Tóm tắt toàn bộ lý thuyết CSDL: ER, SQL, chuẩn hóa",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207286-455378.pdf",
        filePath: "uploads/seed-1786262207286-455378.pdf",
        fileType: "application/pdf",
        fileSize: 439,
        uploader: OID("6a7832bf06aef7954aabe7c5"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7cb"),
        documentType: "Solved Exercises",
        schoolYear: "2024-2025",
        downloadCount: 56,
        viewCount: 130,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207286-455378.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e3"),
        title: "Bài tập OOP Java có lời giải",
        description: "Bài tập lập trình hướng đối tượng Java kèm lời giải",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207286-067237.pdf",
        filePath: "uploads/seed-1786262207286-067237.pdf",
        fileType: "application/pdf",
        fileSize: 429,
        uploader: OID("6a7832bf06aef7954aabe7c3"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7cc"),
        documentType: "Solved Exercises",
        schoolYear: "2024-2025",
        downloadCount: 34,
        viewCount: 78,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207286-067237.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e4"),
        title: "Đề cương ôn tập Mạng máy tính",
        description: "Đề cương chi tiết cho kỳ thi cuối kỳ",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207286-004659.pdf",
        filePath: "uploads/seed-1786262207286-004659.pdf",
        fileType: "application/pdf",
        fileSize: 434,
        uploader: OID("6a7832bf06aef7954aabe7c6"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7cd"),
        documentType: "Lecture Notes",
        schoolYear: "2024-2025",
        downloadCount: 23,
        viewCount: 67,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207286-004659.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e5"),
        title: "Báo cáo đồ án Phân tích thiết kế phần mềm",
        description: "Báo cáo nhóm 8 - Hệ thống UniShare",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207286-015382.pdf",
        filePath: "uploads/seed-1786262207286-015382.pdf",
        fileType: "application/pdf",
        fileSize: 450,
        uploader: OID("6a7832bf06aef7954aabe7c3"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7ce"),
        documentType: "Tutorial",
        schoolYear: "2024-2025",
        downloadCount: 12,
        viewCount: 35,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207286-015382.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e6"),
        title: "Slide Trí tuệ nhân tạo - Machine Learning",
        description: "Bài giảng về các thuật toán ML cơ bản",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207286-232744.pdf",
        filePath: "uploads/seed-1786262207286-232744.pdf",
        fileType: "application/pdf",
        fileSize: 440,
        uploader: OID("6a7832bf06aef7954aabe7c7"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7d0"),
        documentType: "Lecture Notes",
        schoolYear: "2024-2025",
        downloadCount: 45,
        viewCount: 112,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207286-232744.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e7"),
        title: "Cheat sheet Toán rời rạc",
        description: "Tóm tắt công thức tổ hợp, đồ thị, logic",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207286-740737.pdf",
        filePath: "uploads/seed-1786262207286-740737.pdf",
        fileType: "application/pdf",
        fileSize: 422,
        uploader: OID("6a7832bf06aef7954aabe7c4"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7d1"),
        documentType: "Lecture Notes",
        schoolYear: "2024-2025",
        downloadCount: 67,
        viewCount: 155,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207286-740737.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e8"),
        title: "Đề thi cuối kỳ Giải tích 1 (5 năm)",
        description: "Tổng hợp đề thi Giải tích 1 từ 2019-2024",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207287-059187.pdf",
        filePath: "uploads/seed-1786262207287-059187.pdf",
        fileType: "application/pdf",
        fileSize: 438,
        uploader: OID("6a7832bf06aef7954aabe7c5"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7d2"),
        documentType: "Exam Paper",
        schoolYear: "2024-2025",
        downloadCount: 120,
        viewCount: 310,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207287-059187.png"
      },
      {
        _id: OID("6a7832bf06aef7954aabe7e9"),
        title: "Công thức Xác suất thống kê",
        description: "Tổng hợp công thức cần nhớ",
        fileUrl: "http://localhost:8000/uploads/seed-1786262207287-098638.pdf",
        filePath: "uploads/seed-1786262207287-098638.pdf",
        fileType: "application/pdf",
        fileSize: 429,
        uploader: OID("6a7832bf06aef7954aabe7c6"),
        status: "VISIBLE",
        subject: OID("6a7832bf06aef7954aabe7d5"),
        documentType: "Lecture Notes",
        schoolYear: "2024-2025",
        downloadCount: 78,
        viewCount: 190,
        __v: 0,
        uploadDate: DT("2026-08-09T07:56:47.289Z"),
        updatedAt: DT("2026-08-09T07:56:47.289Z"),
        thumbnailUrl: "http://localhost:8000/uploads/thumbnails/seed-1786262207287-098638.png"
      }
    ],
    logs: [
      {
        _id: OID("6a7835520d215f6527f4f17c"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "LOGIN",
        details: "Đăng nhập: Vũ Viết Huy (huy@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c3")
      },
      {
        _id: OID("6a7835520d215f6527f4f17d"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "LOGIN",
        details: "Đăng nhập: Phạm Quang Minh (minh@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c4")
      },
      {
        _id: OID("6a7835520d215f6527f4f17e"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "LOGIN",
        details: "Đăng nhập: Nguyễn Văn Quang (quang@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c5")
      },
      {
        _id: OID("6a7835520d215f6527f4f17f"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "LOGIN",
        details: "Đăng nhập: Vũ Viết Huy (huy@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c3")
      },
      {
        _id: OID("6a7835520d215f6527f4f180"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "LOGIN",
        details: "Đăng nhập: Nguyễn Duy Tiến (tien@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c6")
      },
      {
        _id: OID("6a7835520d215f6527f4f181"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "LOGIN",
        details: "Đăng nhập: Vũ Viết Huy (huy@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c3")
      },
      {
        _id: OID("6a7835520d215f6527f4f182"),
        performedBy: OID("6a7832bf06aef7954aabe7c7"),
        action: "LOGIN",
        details: "Đăng nhập: Hà Nguyễn Trúc Linh (linh@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c7")
      },
      {
        _id: OID("6a7835520d215f6527f4f183"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "LOGIN",
        details: "Đăng nhập: Phạm Quang Minh (minh@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c4")
      },
      {
        _id: OID("6a7835520d215f6527f4f184"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "LOGIN",
        details: "Đăng nhập: Nguyễn Văn Quang (quang@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c5")
      },
      {
        _id: OID("6a7835520d215f6527f4f185"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "LOGIN",
        details: "Đăng nhập: Nguyễn Duy Tiến (tien@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:44:47.289Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c6")
      },
      {
        _id: OID("6a7835520d215f6527f4f186"),
        performedBy: OID("6a7832bf06aef7954aabe7c1"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: System Admin (admin@unishare.com)",
        createdAt: DT("2026-08-09T07:56:47.266Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c1")
      },
      {
        _id: OID("6a7835520d215f6527f4f187"),
        performedBy: OID("6a7832bf06aef7954aabe7c2"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: Nguyễn Văn Moderator (mod@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c2")
      },
      {
        _id: OID("6a7835520d215f6527f4f188"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: Vũ Viết Huy (huy@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c3")
      },
      {
        _id: OID("6a7835520d215f6527f4f189"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: Phạm Quang Minh (minh@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c4")
      },
      {
        _id: OID("6a7835520d215f6527f4f18a"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: Nguyễn Văn Quang (quang@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c5")
      },
      {
        _id: OID("6a7835520d215f6527f4f18b"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: Nguyễn Duy Tiến (tien@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c6")
      },
      {
        _id: OID("6a7835520d215f6527f4f18c"),
        performedBy: OID("6a7832bf06aef7954aabe7c7"),
        action: "REGISTER",
        details: "Đăng ký tài khoản mới: Hà Nguyễn Trúc Linh (linh@st.phenikaa-uni.edu.vn)",
        createdAt: DT("2026-08-09T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c7")
      },
      {
        _id: OID("6a7835520d215f6527f4f18d"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Slide bài giảng Nhập môn lập trình - Chương 1\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e0")
      },
      {
        _id: OID("6a7835520d215f6527f4f18e"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Đề thi giữa kỳ Cấu trúc dữ liệu 2024\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e1")
      },
      {
        _id: OID("6a7835520d215f6527f4f18f"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Tổng hợp lý thuyết Cơ sở dữ liệu\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e2")
      },
      {
        _id: OID("6a7835520d215f6527f4f190"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Bài tập OOP Java có lời giải\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e3")
      },
      {
        _id: OID("6a7835520d215f6527f4f191"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Đề cương ôn tập Mạng máy tính\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e4")
      },
      {
        _id: OID("6a7835520d215f6527f4f192"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Báo cáo đồ án Phân tích thiết kế phần mềm\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e5")
      },
      {
        _id: OID("6a7835520d215f6527f4f193"),
        performedBy: OID("6a7832bf06aef7954aabe7c7"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Slide Trí tuệ nhân tạo - Machine Learning\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e6")
      },
      {
        _id: OID("6a7835520d215f6527f4f194"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Cheat sheet Toán rời rạc\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e7")
      },
      {
        _id: OID("6a7835520d215f6527f4f195"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Đề thi cuối kỳ Giải tích 1 (5 năm)\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e8")
      },
      {
        _id: OID("6a7835520d215f6527f4f196"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "UPLOAD_DOCUMENT",
        details: "Upload tài liệu \"Công thức Xác suất thống kê\"",
        createdAt: DT("2026-08-09T07:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e9")
      },
      {
        _id: OID("6a7835520d215f6527f4f197"),
        performedBy: OID("6a7832bf06aef7954aabe7c1"),
        action: "PROMOTE_USER",
        details: "Thăng cấp Nguyễn Văn Moderator (mod@st.phenikaa-uni.edu.vn) từ USER lên MODERATOR",
        createdAt: DT("2026-08-09T08:26:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c2")
      },
      {
        _id: OID("6a7835520d215f6527f4f198"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Slide bài giảng Nhập môn lập trình - Chương 1\"",
        createdAt: DT("2026-08-09T08:43:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e0")
      },
      {
        _id: OID("6a7835520d215f6527f4f199"),
        performedBy: OID("6a7832bf06aef7954aabe7c1"),
        action: "CREATE_SUBJECT",
        details: "Tạo môn học \"Nhập môn lập trình\" (CSE101)",
        createdAt: DT("2026-08-09T08:56:47.266Z"),
        __v: 0
      },
      {
        _id: OID("6a7835520d215f6527f4f19a"),
        performedBy: OID("6a7832bf06aef7954aabe7c1"),
        action: "CREATE_SUBJECT",
        details: "Tạo môn học \"Cấu trúc dữ liệu và giải thuật\" (CSE201)",
        createdAt: DT("2026-08-09T09:00:47.266Z"),
        __v: 0
      },
      {
        _id: OID("6a7835520d215f6527f4f19b"),
        performedBy: OID("6a7832bf06aef7954aabe7c1"),
        action: "CREATE_MAJOR",
        details: "Tạo ngành học \"Công nghệ thông tin\"",
        createdAt: DT("2026-08-09T09:07:47.266Z"),
        __v: 0
      },
      {
        _id: OID("6a7835520d215f6527f4f19c"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Slide bài giảng Nhập môn lập trình - Chương 1\"",
        createdAt: DT("2026-08-09T09:30:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e0")
      },
      {
        _id: OID("6a7835520d215f6527f4f19d"),
        performedBy: OID("6a7832bf06aef7954aabe7c1"),
        action: "LOGOUT",
        details: "Đăng xuất khỏi hệ thống",
        createdAt: DT("2026-08-09T09:51:47.266Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c1")
      },
      {
        _id: OID("6a7835520d215f6527f4f19e"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Đề thi giữa kỳ Cấu trúc dữ liệu 2024\"",
        createdAt: DT("2026-08-09T10:17:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e1")
      },
      {
        _id: OID("6a7835520d215f6527f4f19f"),
        performedBy: OID("6a7832bf06aef7954aabe7c2"),
        action: "BLOCK_DOCUMENT",
        details: "Block tài liệu \"Slide bài giảng Nhập môn lập trình - Chương 1\" của Vũ Viết Huy",
        createdAt: DT("2026-08-09T10:56:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e0")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a0"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Tổng hợp lý thuyết Cơ sở dữ liệu\"",
        createdAt: DT("2026-08-09T11:04:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e2")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a1"),
        performedBy: OID("6a7832bf06aef7954aabe7c7"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Bài tập OOP Java có lời giải\"",
        createdAt: DT("2026-08-09T11:51:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e3")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a2"),
        performedBy: OID("6a7832bf06aef7954aabe7c2"),
        action: "UNBLOCK_DOCUMENT",
        details: "Bỏ block tài liệu \"Slide bài giảng Nhập môn lập trình - Chương 1\" của Vũ Viết Huy",
        createdAt: DT("2026-08-09T12:26:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e0")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a3"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Báo cáo đồ án Phân tích thiết kế phần mềm\"",
        createdAt: DT("2026-08-09T12:38:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e5")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a4"),
        performedBy: OID("6a7832bf06aef7954aabe7c4"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Slide Trí tuệ nhân tạo - Machine Learning\"",
        createdAt: DT("2026-08-09T13:25:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e6")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a5"),
        performedBy: OID("6a7832bf06aef7954aabe7c6"),
        action: "DOWNLOAD_DOCUMENT",
        details: "Tải tài liệu \"Đề thi cuối kỳ Giải tích 1 (5 năm)\"",
        createdAt: DT("2026-08-09T14:12:47.289Z"),
        __v: 0,
        targetDocument: OID("6a7832bf06aef7954aabe7e8")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a6"),
        performedBy: OID("6a7832bf06aef7954aabe7c3"),
        action: "UPDATE_PROFILE",
        details: "Cập nhật thông tin cá nhân: fullName",
        createdAt: DT("2026-08-11T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c3")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a7"),
        performedBy: OID("6a7832bf06aef7954aabe7c5"),
        action: "CHANGE_PASSWORD",
        details: "Đổi mật khẩu thành công",
        createdAt: DT("2026-08-14T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c5")
      },
      {
        _id: OID("6a7835520d215f6527f4f1a8"),
        performedBy: OID("6a7832bf06aef7954aabe7c7"),
        action: "FORGOT_PASSWORD",
        details: "Yêu cầu reset mật khẩu cho linh@st.phenikaa-uni.edu.vn",
        createdAt: DT("2026-08-18T07:56:47.267Z"),
        __v: 0,
        targetUser: OID("6a7832bf06aef7954aabe7c7")
      }
    ],
    majors: [
      {
        _id: OID("6a7832bf06aef7954aabe7dc"),
        name: "Công nghệ thông tin",
        code: "CNTT",
        description: "Khoa CNTT",
        subjects: [
          OID("6a7832bf06aef7954aabe7c9"),
          OID("6a7832bf06aef7954aabe7ca"),
          OID("6a7832bf06aef7954aabe7cb"),
          OID("6a7832bf06aef7954aabe7cc"),
          OID("6a7832bf06aef7954aabe7cd"),
          OID("6a7832bf06aef7954aabe7ce"),
          OID("6a7832bf06aef7954aabe7cf"),
          OID("6a7832bf06aef7954aabe7d0"),
          OID("6a7832bf06aef7954aabe7d1"),
          OID("6a7832bf06aef7954aabe7d2"),
          OID("6a7832bf06aef7954aabe7d3"),
          OID("6a7832bf06aef7954aabe7d4"),
          OID("6a7832bf06aef7954aabe7d5"),
          OID("6a7832bf06aef7954aabe7d6")
        ],
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.282Z"),
        updatedAt: DT("2026-08-09T07:56:47.282Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7dd"),
        name: "Khoa học máy tính",
        code: "CS",
        description: "Ngành KHMT",
        subjects: [
          OID("6a7832bf06aef7954aabe7c9"),
          OID("6a7832bf06aef7954aabe7ca"),
          OID("6a7832bf06aef7954aabe7cb"),
          OID("6a7832bf06aef7954aabe7cc"),
          OID("6a7832bf06aef7954aabe7cd"),
          OID("6a7832bf06aef7954aabe7ce"),
          OID("6a7832bf06aef7954aabe7cf"),
          OID("6a7832bf06aef7954aabe7d0"),
          OID("6a7832bf06aef7954aabe7d1")
        ],
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.283Z"),
        updatedAt: DT("2026-08-09T07:56:47.283Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7de"),
        name: "Kinh tế",
        code: "KT",
        description: "Khoa Kinh tế",
        subjects: [
          OID("6a7832bf06aef7954aabe7d7"),
          OID("6a7832bf06aef7954aabe7d8"),
          OID("6a7832bf06aef7954aabe7d2"),
          OID("6a7832bf06aef7954aabe7d3"),
          OID("6a7832bf06aef7954aabe7d4")
        ],
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.283Z"),
        updatedAt: DT("2026-08-09T07:56:47.283Z")
      }
    ],
    platformstats: [
      {
        _id: OID("6a7832bf06aef7954aabe7f0"),
        totalUploads: 10,
        totalDownloads: 539,
        activeUsers: 7,
        __v: 0
      }
    ],
    subjects: [
      {
        _id: OID("6a7832bf06aef7954aabe7c9"),
        name: "Nhập môn lập trình",
        code: "CSE101",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7ca"),
        name: "Cấu trúc dữ liệu và giải thuật",
        code: "CSE201",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7cb"),
        name: "Cơ sở dữ liệu",
        code: "CSE301",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7cc"),
        name: "Lập trình hướng đối tượng",
        code: "CSE202",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7cd"),
        name: "Mạng máy tính",
        code: "CSE302",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7ce"),
        name: "Phân tích và thiết kế phần mềm",
        code: "CSE401",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7cf"),
        name: "Công nghệ phần mềm",
        code: "CSE402",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d0"),
        name: "Trí tuệ nhân tạo",
        code: "CSE501",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d1"),
        name: "Toán rời rạc",
        code: "CSE703024",
        managingFaculty: "CNTT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d2"),
        name: "Giải tích 1",
        code: "MATH101",
        managingFaculty: "KHCB",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d3"),
        name: "Giải tích 2",
        code: "MATH102",
        managingFaculty: "KHCB",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d4"),
        name: "Đại số tuyến tính",
        code: "MATH201",
        managingFaculty: "KHCB",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d5"),
        name: "Xác suất thống kê",
        code: "MATH301",
        managingFaculty: "KHCB",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d6"),
        name: "Vật lý đại cương",
        code: "PHY101",
        managingFaculty: "KHCB",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d7"),
        name: "Kinh tế vi mô",
        code: "ECO101",
        managingFaculty: "KTQT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d8"),
        name: "Kinh tế vĩ mô",
        code: "ECO102",
        managingFaculty: "KTQT",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7d9"),
        name: "Tiếng Anh 1",
        code: "ENG101",
        managingFaculty: "NN",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7da"),
        name: "Tiếng Anh 2",
        code: "ENG102",
        managingFaculty: "NN",
        __v: 0,
        createdAt: DT("2026-08-09T07:56:47.278Z"),
        updatedAt: DT("2026-08-09T07:56:47.278Z")
      }
    ],
    users: [
      {
        _id: OID("6a7832bf06aef7954aabe7c1"),
        email: "admin@unishare.com",
        password: "$2b$10$PBIpzZaD.7UZAFLexPsP8u3rw/qrEkmAx6UbLmJ3luMDV1MHf1lW6",
        fullName: "System Admin",
        avatarUrl: null,
        role: "ADMIN",
        status: "ACTIVE",
        uploadsCount: 0,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.266Z"),
        updatedAt: DT("2026-08-09T07:56:47.266Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7c2"),
        email: "mod@st.phenikaa-uni.edu.vn",
        password: "$2b$10$SWn/NEbvX5gQ3A4QT0dmE.lJJMNuCR8fS12FbeMpoNWo9L0xPNnB6",
        fullName: "Nguyễn Văn Moderator",
        avatarUrl: null,
        role: "MODERATOR",
        status: "ACTIVE",
        uploadsCount: 0,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.267Z"),
        updatedAt: DT("2026-08-09T07:56:47.267Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7c3"),
        email: "huy@st.phenikaa-uni.edu.vn",
        password: "$2b$10$SWn/NEbvX5gQ3A4QT0dmE.lJJMNuCR8fS12FbeMpoNWo9L0xPNnB6",
        fullName: "Vũ Viết Huy",
        avatarUrl: null,
        role: "USER",
        status: "ACTIVE",
        uploadsCount: 3,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.267Z"),
        updatedAt: DT("2026-08-09T07:56:47.292Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7c4"),
        email: "minh@st.phenikaa-uni.edu.vn",
        password: "$2b$10$SWn/NEbvX5gQ3A4QT0dmE.lJJMNuCR8fS12FbeMpoNWo9L0xPNnB6",
        fullName: "Phạm Quang Minh",
        avatarUrl: null,
        role: "USER",
        status: "ACTIVE",
        uploadsCount: 2,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.267Z"),
        updatedAt: DT("2026-08-09T07:56:47.304Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7c5"),
        email: "quang@st.phenikaa-uni.edu.vn",
        password: "$2b$10$SWn/NEbvX5gQ3A4QT0dmE.lJJMNuCR8fS12FbeMpoNWo9L0xPNnB6",
        fullName: "Nguyễn Văn Quang",
        avatarUrl: null,
        role: "USER",
        status: "ACTIVE",
        uploadsCount: 2,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.267Z"),
        updatedAt: DT("2026-08-09T07:56:47.305Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7c6"),
        email: "tien@st.phenikaa-uni.edu.vn",
        password: "$2b$10$SWn/NEbvX5gQ3A4QT0dmE.lJJMNuCR8fS12FbeMpoNWo9L0xPNnB6",
        fullName: "Nguyễn Duy Tiến",
        avatarUrl: null,
        role: "USER",
        status: "ACTIVE",
        uploadsCount: 2,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.267Z"),
        updatedAt: DT("2026-08-09T07:56:47.306Z")
      },
      {
        _id: OID("6a7832bf06aef7954aabe7c7"),
        email: "linh@st.phenikaa-uni.edu.vn",
        password: "$2b$10$SWn/NEbvX5gQ3A4QT0dmE.lJJMNuCR8fS12FbeMpoNWo9L0xPNnB6",
        fullName: "Hà Nguyễn Trúc Linh",
        avatarUrl: null,
        role: "USER",
        status: "ACTIVE",
        uploadsCount: 1,
        downloadsCount: 0,
        __v: 0,
        joinedDate: DT("2026-08-09T07:56:47.267Z"),
        updatedAt: DT("2026-08-09T07:56:47.307Z")
      }
    ]
  };

  var names = Object.keys(DATA);

  if (inShell) {
    // ----- mongosh / Compass -----
    var target = db.getSiblingDB("unishare");
    print('Nap vao database: ' + "unishare");
    var n = 0;
    names.forEach(function (name) {
      target.getCollection(name).deleteMany({});
      if (DATA[name].length) target.getCollection(name).insertMany(DATA[name]);
      print('  ' + name + ': ' + DATA[name].length + ' docs');
      n += DATA[name].length;
    });
    print('Xong: ' + names.length + ' collection, ' + n + ' document.');
    print('Dang nhap: admin@unishare.com / admin123');
  } else {
    // ----- Node -----
    var nodePath = require('path');
    try {
      require('dotenv').config({ path: nodePath.join(__dirname, '..', '.env') });
    } catch (e) { /* không có dotenv cũng không sao */ }

    var uri =
      process.argv[2] ||
      process.env.DATABASE_URL ||
      'mongodb://127.0.0.1:27017/unishare';

    var MongoClient = require('mongodb').MongoClient;

    (async function () {
      var client = new MongoClient(uri);
      await client.connect();
      var target = client.db();
      console.log('Nạp vào database: ' + target.databaseName + '\n');

      var n = 0;
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        await target.collection(name).deleteMany({});
        if (DATA[name].length) await target.collection(name).insertMany(DATA[name]);
        console.log('  ' + name.padEnd(16) + String(DATA[name].length).padStart(4) + ' docs');
        n += DATA[name].length;
      }

      console.log('\nXong: ' + names.length + ' collection, ' + n + ' document.');
      console.log('Đăng nhập: admin@unishare.com / admin123');
      console.log('\nNếu thiếu file trong uploads/, chạy tiếp: npm run db:restore-files');
      await client.close();
    })().catch(function (err) {
      console.error(err);
      process.exit(1);
    });
  }
})();
