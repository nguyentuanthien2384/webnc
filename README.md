<p align="center">
  <img src="frontend/public/logo.png" alt="UniShare Logo" width="80" />
</p>

<h1 align="center">📚 UniShare — Nền tảng Chia sẻ Tài liệu Học tập</h1>

<p align="center">
  <strong>Nền tảng web giúp sinh viên Đại học Phenikaa chia sẻ, tìm kiếm và quản lý tài liệu học tập một cách hiệu quả.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-9-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-UNLICENSED-red" alt="License" />
</p>

---

## 📖 Mục lục

- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [UI/UX Design](#-uiux-design)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt và Chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Hệ thống phân quyền](#-hệ-thống-phân-quyền)
- [Testing](#-testing)
- [Tài khoản Demo](#-tài-khoản-demo)
- [Scripts hữu ích](#-scripts-hữu-ích)
- [Đóng góp](#-đóng-góp)

---

## 🎯 Tổng quan dự án

### Vấn đề

Sinh viên đại học thường gặp khó khăn trong việc tìm kiếm tài liệu học tập (bài giảng, đề thi, bài tập). Tài liệu phân tán trên nhiều kênh khác nhau (Facebook, Zalo, Google Drive) khiến việc tìm kiếm trở nên khó khăn và mất thời gian.

### Giải pháp

**UniShare** là nền tảng web tập trung cho phép sinh viên Đại học Phenikaa:
- 📤 **Upload** tài liệu học tập với metadata đầy đủ (môn học, loại tài liệu, năm học)
- 🔍 **Tìm kiếm & Lọc** tài liệu theo ngành/môn học, loại tài liệu
- 📥 **Tải xuống** tài liệu với xem trước trước khi tải
- 👥 **Quản lý** nội dung với hệ thống phân quyền 3 cấp (User → Moderator → Admin)

### Đối tượng sử dụng

| Vai trò | Đối tượng | Mô tả |
|---------|-----------|-------|
| 👤 **User** | Sinh viên | Upload, tải xuống, chia sẻ tài liệu |
| 🛡️ **Moderator** | Kiểm duyệt viên | Quản lý nội dung & người dùng |
| 👑 **Admin** | Quản trị viên | Toàn quyền quản trị hệ thống |

---

## ✨ Tính năng chính

### 🔐 Authentication & Authorization
- Đăng ký tài khoản với email Phenikaa
- Đăng nhập / Đăng xuất với JWT Authentication
- Quên mật khẩu / Đặt lại mật khẩu qua SMTP email
- Phân quyền 3 vai trò: USER, MODERATOR, ADMIN
- Kiểm tra trạng thái tài khoản (ACTIVE / BLOCKED)

### 📄 Quản lý Tài liệu
- Upload tài liệu multi-step (Drag & Drop → Metadata → Xác nhận)
- Hỗ trợ nhiều định dạng: PDF, DOC, DOCX, hình ảnh, ZIP
- Giới hạn file upload: **100MB**
- Xem trước tài liệu PDF ngay trên trình duyệt
- Tải xuống tài liệu gốc
- Chỉnh sửa / Xóa tài liệu (quyền sở hữu)
- Chia sẻ link tài liệu công khai
- Tự động tạo thumbnail cho PDF

### 🔎 Tìm kiếm & Lọc
- Tìm kiếm toàn cục (debounced) theo tiêu đề
- Lọc theo ngành học / môn học
- Sắp xếp theo ngày đăng, lượt tải
- Chuyển đổi chế độ xem Grid / List
- Phân trang kết quả

### 👤 Hồ sơ Cá nhân
- Xem & chỉnh sửa profile
- Upload avatar (Cloudinary)
- Đổi mật khẩu
- Xem thống kê upload cá nhân
- Xem profile người dùng khác
- Tự xóa tài khoản

### 📊 Thống kê & Dashboard
- Thống kê nền tảng: tổng uploads, downloads, users
- Biểu đồ uploads theo thời gian (Recharts LineChart)
- Dashboard riêng cho Moderator / Admin

### 🛠️ Quản trị (Admin Panel)
- Quản lý người dùng: danh sách, tìm kiếm, lọc role, chặn/bỏ chặn
- Quản lý tài liệu: chặn/bỏ chặn, xóa
- CRUD Môn học & Ngành học
- Thay đổi vai trò người dùng
- Reset mật khẩu người dùng
- Ủy quyền Admin (chỉ 1 Admin tại một thời điểm)
- Xem logs hệ thống

### ✏️ Editor & Báo cáo
- Trình soạn thảo nội dung (Editor.js) với quản lý bản nháp
- Báo cáo tài liệu vi phạm
- Xem và xử lý báo cáo (Moderator/Admin)

---

## 🏗️ Kiến trúc hệ thống

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│         Next.js 16 · React 19 · TypeScript · Tailwind CSS 4         │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │   Pages    │  │ Components │  │   Hooks   │  │    Stores      │  │
│  │ (App       │  │ (UI        │  │ (TanStack │  │  (Zustand)     │  │
│  │  Router)   │  │  Library)  │  │  Query)   │  │                │  │
│  └───────────┘  └────────────┘  └───────────┘  └────────────────┘  │
│                           │  axios (HTTP)                           │
└───────────────────────────┼─────────────────────────────────────────┘
                            │  REST API (JSON)
                            ▼
┌───────────────────────────┼─────────────────────────────────────────┐
│                       SERVER (NestJS 11)                            │
│           Port: 8000  │  Global Prefix: /api                        │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌────────────────┐  │
│  │Controllers│  │  Services  │  │  Guards   │  │   Schemas      │  │
│  │ (Routes)  │  │ (Business  │  │ (JWT +    │  │  (Mongoose)    │  │
│  │           │  │   Logic)   │  │   Role)   │  │                │  │
│  └───────────┘  └────────────┘  └───────────┘  └────────────────┘  │
│                           │  Mongoose ODM                           │
└───────────────────────────┼─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                             │
│   Collections: users · documents · subjects · majors ·              │
│                reports · logs · platformstats · editors              │
└─────────────────────────────────────────────────────────────────────┘
```

### Backend Module Architecture

```
                           AppModule
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
     ConfigModule       MongooseModule        (Global)
     (isGlobal)         (DATABASE_URL)
          │
     ┌────┴─────┬─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
     │          │         │          │          │          │          │          │
   Auth     Users    Documents    Admin    Statistics    Logs    Categories  Reports  Editor
     │          │         │          │          │          │          │          │
  Passport   Mongoose   Multer    Users     Mongoose   Mongoose  Subjects  Mongoose  Mongoose
  JWT                   Validate   Docs                          Majors
                        Thumbnails Stats
                                   Logs
```

---

## 🔧 Công nghệ sử dụng

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|----------|
| **NestJS** | 11 | Framework chính, kiến trúc module |
| **MongoDB** | — | Cơ sở dữ liệu NoSQL |
| **Mongoose** | 9 | ODM cho MongoDB |
| **Passport + JWT** | — | Xác thực stateless |
| **bcrypt** | 6 | Hash mật khẩu (salt rounds) |
| **Multer** | 2 | Xử lý file upload multipart |
| **class-validator** | 0.14 | Validation DTO |
| **class-transformer** | 0.5 | Transform DTO |
| **Nodemailer** | 10 | Gửi email khôi phục mật khẩu |
| **pdf-to-png-converter** | 3 | Tạo thumbnail từ PDF |
| **TypeScript** | 5 | Ngôn ngữ lập trình |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|:---------:|----------|
| **Next.js** | 16 | React framework (App Router) |
| **React** | 19 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Styling framework |
| **TanStack Query** | 5 | Server state management, caching |
| **Zustand** | 5 | Client state management |
| **Axios** | 1 | HTTP client |
| **Headless UI** | 2 | Accessible UI components (Modal, Menu) |
| **Heroicons** | 2 | Icon set |
| **Recharts** | 3 | Biểu đồ thống kê |
| **react-hot-toast** | 2 | Toast notifications |
| **react-dropzone** | 14 | Drag & drop file upload |
| **react-pdf** | 11 | Xem trước PDF |
| **Editor.js** | 2 | Block-based editor |
| **docx-preview** | 0.4 | Xem trước DOCX |
| **exceljs** | 4 | Xuất dữ liệu Excel |
| **next-cloudinary** | 6 | Upload avatar lên Cloudinary |
| **next-themes** | 0.4 | Hỗ trợ dark mode |
| **Playwright** | 1 | E2E testing |

---

## 🎨 UI/UX Design

### Triết lý Thiết kế

UniShare được thiết kế với triết lý **"Clean, Modern & Functional"** — giao diện sạch sẽ, hiện đại, tập trung vào trải nghiệm người dùng:

- 🎨 **Color Palette**: Blue / Gray palette chuyên nghiệp, phù hợp môi trường giáo dục
- 🔤 **Typography**: Inter font — hiện đại, dễ đọc trên mọi kích thước
- 📐 **Layout**: Responsive design, mobile-friendly
- ✨ **Interactions**: Smooth transitions, hover effects, skeleton loaders

### Design System

| Yếu tố | Chi tiết |
|---------|----------|
| **Color Scheme** | Primary Blue (#3B82F6), Gray scale, semantic colors |
| **Font** | Inter (Google Fonts) |
| **Icon Set** | Heroicons v2 (outline style) |
| **Spacing** | Tailwind CSS spacing system (4px base) |
| **Border Radius** | Rounded corners (8px-12px) |
| **Shadows** | Subtle box-shadows cho cards và modals |
| **Breakpoints** | sm: 640px, md: 768px, lg: 1024px, xl: 1280px |

### Danh sách Màn hình (15+ screens)

| # | Màn hình | Route | Mô tả |
|:-:|----------|-------|-------|
| 1 | 🔑 Đăng nhập | `/login` | Split layout: branding bên trái + form email/password bên phải |
| 2 | 📝 Đăng ký | `/register` | Form đăng ký với validation email Phenikaa |
| 3 | 🔓 Quên mật khẩu | `/forgot-password` | Nhập email để nhận link đặt lại mật khẩu |
| 4 | 🔄 Đặt lại mật khẩu | `/reset-password` | Form nhập mật khẩu mới |
| 5 | 🏠 Trang chủ | `/` | Grid/List view tài liệu, filter sidebar, search bar, sort |
| 6 | 📤 Upload — Bước 1 | `/upload` | Drag & drop zone chọn file |
| 7 | 📤 Upload — Bước 2 | `/upload` | Form nhập metadata (môn, tiêu đề, mô tả, năm, loại) |
| 8 | ✅ Upload — Bước 3 | `/upload` | Xác nhận upload thành công |
| 9 | 📄 Chi tiết tài liệu | `/document/[id]` | Preview PDF, thông tin chi tiết, nút download/share |
| 10 | 👤 Profile cá nhân | `/profile/me` | Avatar, stats, danh sách tài liệu, settings |
| 11 | 👥 Profile người khác | `/profile/[userId]` | Xem profile công khai + tài liệu đã upload |
| 12 | 📊 Thống kê | `/statistics` | Dashboard stats + biểu đồ uploads theo thời gian |
| 13 | 📝 Editor | `/editor` | Trình soạn thảo nội dung block-based |
| 14 | ⚙️ Admin — Quản lý Môn học | `/admin/manager` (tab) | CRUD subjects |
| 15 | ⚙️ Admin — Quản lý Ngành học | `/admin/manager` (tab) | CRUD majors |
| 16 | ⚙️ Admin — Quản lý Tài liệu | `/admin/manager` (tab) | Block/unblock/delete documents |
| 17 | ⚙️ Admin — Quản lý Người dùng | `/admin/manager` (tab) | Block/unblock/role/reset/delegate |
| 18 | ⚙️ Admin — Logs hệ thống | `/admin/manager` (tab) | Xem lịch sử thao tác quản trị |

### UI Components

#### Layout Components
| Component | File | Mô tả |
|-----------|------|-------|
| `Navbar` | `components/layout/Navbar.tsx` | Navigation bar: logo, search, links, user menu dropdown |
| `FilterSidebar` | `components/layout/FilterSidebar.tsx` | Sidebar lọc theo ngành/môn học |
| `GlobalSearch` | `components/layout/GlobalSearch.tsx` | Thanh tìm kiếm toàn cục với debounce |

#### Document Components
| Component | File | Mô tả |
|-----------|------|-------|
| `DocumentCard` | `components/documents/DocumentCard.tsx` | Card hiển thị tài liệu (Grid/List mode) |
| `DocumentPreview` | `components/documents/DocumentPreview.tsx` | Preview tài liệu (PDF, DOCX, Image) |
| `PdfPreview` | `components/documents/PdfPreview.tsx` | Xem trước PDF inline |
| `ReportDocumentModal` | `components/documents/ReportDocumentModal.tsx` | Modal báo cáo tài liệu vi phạm |

#### Profile Components
| Component | File | Mô tả |
|-----------|------|-------|
| `ProfileHeader` | `components/profile/ProfileHeader.tsx` | Header profile: avatar, tên, thống kê |
| `EditProfileModal` | `components/profile/EditProfileModal.tsx` | Modal chỉnh sửa thông tin cá nhân |
| `ChangePasswordModal` | `components/profile/ChangePasswordModal.tsx` | Modal đổi mật khẩu |
| `DeleteAccountModal` | `components/profile/DeleteAccountModal.tsx` | Modal xác nhận xóa tài khoản |
| `EditDocumentModal` | `components/profile/EditDocumentModal.tsx` | Modal chỉnh sửa tài liệu |
| `MyDocumentListItem` | `components/profile/MyDocumentListItem.tsx` | Item tài liệu trong profile |

#### Upload Components
| Component | File | Mô tả |
|-----------|------|-------|
| `FileUploadStep` | `components/upload/FileUploadStep.tsx` | Bước 1: Drag & drop file |
| `FileDetailsStep` | `components/upload/FileDetailsStep.tsx` | Bước 2: Form metadata |
| `UploadDoneStep` | `components/upload/UploadDoneStep.tsx` | Bước 3: Xác nhận thành công |

#### Common Components
| Component | File | Mô tả |
|-----------|------|-------|
| `DeleteConfirmModal` | `components/common/DeleteConfirmModal.tsx` | Modal xác nhận xóa generic |
| `Pagination` | `components/common/Pagination.tsx` | Component phân trang |
| `SortDropdown` | `components/common/SortDropdown.tsx` | Dropdown sắp xếp |

#### Auth Guards
| Component | File | Mô tả |
|-----------|------|-------|
| `AuthGuard` | `components/auth/AuthGuard.tsx` | Guard kiểm tra đăng nhập |
| `RoleGuard` | `components/auth/RoleGuard.tsx` | Guard kiểm tra vai trò |

### UX Patterns

| Pattern | Triển khai |
|---------|-----------|
| **Loading States** | Skeleton loaders, loading spinners |
| **Empty States** | Icons + messages khi không có dữ liệu |
| **Error Handling** | Toast notifications (react-hot-toast) |
| **Form Validation** | Client-side (real-time) + Server-side validation |
| **Confirmation Dialogs** | Modal xác nhận cho các thao tác quan trọng (xóa) |
| **Debounced Search** | Tìm kiếm với debounce tránh request thừa |
| **Optimistic Updates** | TanStack Query invalidation sau mutation |
| **Responsive Design** | Mobile-first với Tailwind breakpoints |
| **Accessible Components** | Headless UI (focus management, keyboard nav) |

### User Flow Diagrams

#### Flow Đăng ký & Đăng nhập
```
Guest ──→ /register ──→ Nhập email Phenikaa + password
                              │
                              ▼
                        Validation OK? ──No──→ Hiển thị lỗi
                              │
                             Yes
                              ▼
                     Tạo tài khoản ──→ /login
                              │
                              ▼
                     Nhập email/password
                              │
                              ▼
                     JWT Token ──→ Lưu localStorage
                              │
                              ▼
                     Redirect ──→ / (Trang chủ)
```

#### Flow Upload Tài liệu
```
User ──→ /upload ──→ Step 1: Drag & Drop file
                          │
                          ▼  (File < 100MB, đúng định dạng)
                     Step 2: Nhập metadata
                          │  - Tiêu đề
                          │  - Mô tả
                          │  - Chọn môn học
                          │  - Loại tài liệu
                          │  - Năm học
                          │
                          ▼
                     Step 3: Upload thành công!
                          │
                          ▼
                     Auto-generate thumbnail (PDF)
                          │
                          ▼
                     Tài liệu hiển thị trên trang chủ
```

#### Flow Tìm kiếm & Tải tài liệu
```
User ──→ / (Trang chủ)
         │
         ├──→ Tìm kiếm: nhập keyword (debounced)
         ├──→ Lọc: chọn ngành / môn học (sidebar)
         ├──→ Sắp xếp: ngày đăng / lượt tải
         ├──→ Chế độ xem: Grid ⟷ List
         │
         ▼
    Kết quả ──→ Click card ──→ /document/[id]
                                    │
                                    ├──→ Xem trước PDF
                                    ├──→ Download file
                                    ├──→ Share link
                                    └──→ Báo cáo vi phạm
```

#### Flow Quản trị
```
Admin/Mod ──→ /admin/manager
                   │
                   ├──→ Tab "Môn học": CRUD subjects
                   ├──→ Tab "Ngành học": CRUD majors
                   ├──→ Tab "Tài liệu": Block/Unblock/Delete
                   ├──→ Tab "Người dùng": Block/Unblock/Role/Reset/Delete/Delegate
                   └──→ Tab "Logs": Xem lịch sử thao tác
```

---

## 📂 Cấu trúc thư mục

### Tổng quan

```
webnc/
├── 📁 backend/                    # NestJS Backend API
│   ├── 📁 database/               # Scripts import/export DB
│   ├── 📁 src/                    # Source code
│   ├── 📁 test/                   # E2E tests
│   ├── 📁 uploads/                # Uploaded files storage
│   ├── .env.example               # Biến môi trường mẫu
│   ├── package.json
│   └── tsconfig.json
│
├── 📁 frontend/                   # Next.js Frontend
│   ├── 📁 public/                 # Static assets
│   ├── 📁 src/                    # Source code
│   ├── 📁 tests/                  # E2E tests (Playwright)
│   ├── .env.example               # Biến môi trường mẫu
│   ├── package.json
│   └── tsconfig.json
│
├── PHAN_QUYEN.md                  # Tài liệu phân quyền
└── README.md                      # File này
```

### Backend (`backend/src/`)

```
src/
├── main.ts                        # Entry point (bootstrap NestJS)
├── app.module.ts                  # Root module — import tất cả modules
├── configure-app.ts               # CORS, ValidationPipe, GlobalPrefix
│
├── 📁 auth/                       # Module xác thực
│   ├── auth.controller.ts         #   POST /register, /login, GET /me
│   ├── auth.service.ts            #   Logic đăng ký, đăng nhập
│   ├── auth.module.ts             #   Module config
│   ├── mail.service.ts            #   Gửi email (SMTP)
│   ├── password-recovery.service.ts #  Quên/đặt lại mật khẩu
│   ├── permissions.ts             #   Enum Permission + ROLE_PERMISSIONS map
│   ├── 📁 decorators/             #   @Roles(), @CurrentUser()
│   ├── 📁 dto/                    #   RegisterDto, LoginDto
│   ├── 📁 guards/                 #   JwtAuthGuard, RolesGuard
│   ├── 📁 schemas/                #   Token schemas
│   └── 📁 strategies/             #   Passport JWT Strategy
│
├── 📁 users/                      # Module người dùng
│   ├── user.controller.ts         #   GET/PATCH /me/profile, change-password
│   ├── users.service.ts           #   Logic CRUD users
│   └── 📁 schemas/
│       └── user.schema.ts         #   User model (email, role, status...)
│
├── 📁 documents/                  # Module tài liệu
│   ├── documents.controller.ts    #   CRUD + upload/download/preview
│   ├── documents.service.ts       #   Logic quản lý tài liệu & files
│   ├── validate-uploaded-document.ts # Validate file type & size
│   ├── cleanup-failed-upload.interceptor.ts # Cleanup on failure
│   └── 📁 schemas/
│       └── document.schema.ts     #   Document model (title, fileUrl, status...)
│
├── 📁 admin/                      # Module quản trị
│   └── (controllers, services cho user/document management)
│
├── 📁 categories/                 # Module danh mục công khai
│   └── (GET subjects, majors — không cần auth)
│
├── 📁 subjects/                   # Module môn học
│   └── 📁 schemas/
│       └── subject.schema.ts      #   Subject model (name, code, faculty)
│
├── 📁 majors/                     # Module ngành học
│   └── 📁 schemas/
│       └── major.schema.ts        #   Major model (name, code, subjects[])
│
├── 📁 reports/                    # Module báo cáo vi phạm
│   ├── reports.controller.ts      #   CRUD reports
│   ├── reports.service.ts         #   Logic xử lý báo cáo
│   └── report.schema.ts          #   Report model
│
├── 📁 editor/                     # Module editor (bản nháp)
│   └── (CRUD drafts cho block editor)
│
├── 📁 statistics/                 # Module thống kê
│   └── (platform stats, uploads-over-time)
│
├── 📁 logs/                       # Module logs hệ thống
│   └── (admin action audit trail)
│
├── 📁 common/                     # Shared utilities
│   └── 📁 filters/
│       └── cast-error.filter.ts   #   Xử lý Mongoose CastError
│
├── create-admin.ts                # Script tạo tài khoản Admin
├── seed-database.ts               # Script seed dữ liệu mẫu
├── generate-thumbnails.ts         # Script tạo thumbnail PDF
├── refresh-demo-pdfs.ts           # Script sửa demo PDFs
└── clear-documents.ts             # Script xóa tất cả tài liệu
```

### Frontend (`frontend/src/`)

```
src/
├── 📁 app/                        # Next.js App Router
│   ├── layout.tsx                 #   Root layout (html, body, providers)
│   ├── providers.tsx              #   QueryClient, ThemeProvider
│   ├── globals.css                #   Global styles + Tailwind imports
│   │
│   ├── 📁 (auth)/                 #   Auth route group (no layout navbar)
│   │   ├── layout.tsx             #     Split layout (branding + form)
│   │   ├── 📁 login/             #     /login page
│   │   ├── 📁 register/          #     /register page
│   │   ├── 📁 forgot-password/   #     /forgot-password page
│   │   └── 📁 reset-password/    #     /reset-password page
│   │
│   └── 📁 (main)/                #   Main route group (with navbar)
│       ├── layout.tsx             #     Layout with Navbar
│       ├── page.tsx               #     / — Trang chủ (danh sách tài liệu)
│       ├── 📁 document/          #     /document/[id] — Chi tiết tài liệu
│       ├── 📁 upload/            #     /upload — Upload tài liệu (3 bước)
│       ├── 📁 profile/           #     /profile/me & /profile/[userId]
│       ├── 📁 statistics/        #     /statistics — Dashboard thống kê
│       ├── 📁 editor/            #     /editor — Trình soạn thảo
│       ├── 📁 dashboard/         #     /dashboard — Dashboard cá nhân
│       └── 📁 admin/
│           └── 📁 manager/       #     /admin/manager — Trang quản trị
│
├── 📁 components/                 #   React components
│   ├── 📁 auth/                  #     AuthGuard, RoleGuard
│   ├── 📁 common/               #     DeleteConfirmModal, Pagination, SortDropdown
│   ├── 📁 documents/            #     DocumentCard, PdfPreview, DocumentPreview
│   ├── 📁 editor/               #     JsonBlockEditor
│   ├── 📁 layout/               #     Navbar, FilterSidebar, GlobalSearch
│   ├── 📁 profile/              #     ProfileHeader, EditProfileModal, ...
│   ├── 📁 statistics/           #     UploadsOverTimeChart
│   └── 📁 upload/               #     FileUploadStep, FileDetailsStep, UploadDoneStep
│
├── 📁 hooks/                      #   Custom React hooks (TanStack Query)
│   ├── useDocuments.ts            #     Fetch danh sách tài liệu
│   ├── useDocumentDetail.ts       #     Fetch chi tiết tài liệu
│   ├── useUploadDocument.ts       #     Upload mutation
│   ├── useMutateDocument.ts       #     Update/delete document mutations
│   ├── useMyDocuments.ts          #     Fetch tài liệu của tôi
│   ├── useMyProfile.ts            #     Fetch profile cá nhân
│   ├── useMyStats.ts              #     Fetch thống kê cá nhân
│   ├── useUpdateProfile.ts        #     Update profile mutation
│   ├── useUserProfile.ts          #     Fetch profile người khác
│   ├── useUserMutations.ts        #     User mutations (delete account, etc.)
│   ├── useCategories.ts           #     Fetch danh mục (subjects, majors)
│   ├── usePlatformStats.ts        #     Fetch thống kê nền tảng
│   ├── useUploadsOverTime.ts      #     Fetch dữ liệu biểu đồ
│   ├── useAdminData.ts            #     Fetch dữ liệu admin panel
│   ├── useAdminMutateUser.ts      #     Admin user mutations
│   ├── useAdminMutateDocument.ts  #     Admin document mutations
│   └── useDebounce.ts             #     Debounce utility hook
│
├── 📁 store/                      #   Zustand stores
│   ├── auth.store.ts              #     Auth state (user, token, login/logout)
│   ├── admin.store.ts             #     Admin panel state (filters, tabs)
│   └── search.store.ts            #     Search state (query)
│
├── 📁 lib/                        #   Utilities
│   ├── axios.ts                   #     Axios instance (baseURL, interceptors)
│   ├── apiError.ts                #     Error handling helpers
│   ├── permissions.ts             #     Frontend permission checks
│   ├── downloadCsv.ts             #     Export CSV utility
│   └── downloadExcel.ts           #     Export Excel utility
│
└── 📁 @types/                     #   TypeScript type definitions
```

---

## 🚀 Cài đặt và Chạy dự án

### Yêu cầu hệ thống

| Phần mềm | Phiên bản tối thiểu |
|-----------|:-------------------:|
| **Node.js** | ≥ 18.x |
| **npm** | ≥ 9.x |
| **MongoDB** | ≥ 6.x |
| **Git** | ≥ 2.x |

### 1. Clone repository

```bash
git clone <repository-url>
cd webnc
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin của bạn:

```env
PORT=8000
DATABASE_URL=mongodb://127.0.0.1:27017/unishare
JWT_SECRET=your_jwt_secret_key_here
API_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# SMTP (tùy chọn — cần cho chức năng quên mật khẩu)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASSWORD=
# SMTP_FROM=UniShare <no-reply@example.com>
# SMTP_REQUIRE_TLS=true

# Mật khẩu Admin (ít nhất 12 ký tự, cần trước khi chạy seed:admin)
# ADMIN_PASSWORD=your_secure_password
```

Tạo tài khoản Admin và seed dữ liệu mẫu:

```bash
npm run seed:admin       # Tạo tài khoản Admin
npm run seed:db          # Seed dữ liệu mẫu (subjects, majors, users, documents)
```

Khởi chạy Backend:

```bash
npm run start:dev        # Development mode (hot-reload), port 8000
```

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
```

Tạo file `.env.local`:

```bash
cp .env.example .env.local
```

Nội dung `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Khởi chạy Frontend:

```bash
npm run dev              # Development mode, port 3000
```

### 4. Truy cập ứng dụng

| Service | URL |
|---------|-----|
| 🌐 Frontend | [http://localhost:3000](http://localhost:3000) |
| ⚙️ Backend API | [http://localhost:8000/api](http://localhost:8000/api) |
| 🗄️ MongoDB | `mongodb://127.0.0.1:27017/unishare` |

---

## 🔑 Biến môi trường

### Backend (`.env`)

| Biến | Bắt buộc | Mô tả | Mặc định |
|------|:--------:|-------|----------|
| `PORT` | ❌ | Port server | `8000` |
| `DATABASE_URL` | ✅ | MongoDB connection string | — |
| `JWT_SECRET` | ✅ | Secret key cho JWT | — |
| `API_URL` | ✅ | URL backend API | — |
| `FRONTEND_URL` | ✅ | URL frontend (CORS) | — |
| `SMTP_HOST` | ❌ | SMTP server host | — |
| `SMTP_PORT` | ❌ | SMTP server port | `587` |
| `SMTP_USER` | ❌ | SMTP username | — |
| `SMTP_PASSWORD` | ❌ | SMTP password | — |
| `SMTP_FROM` | ❌ | Email sender address | — |
| `SMTP_REQUIRE_TLS` | ❌ | Bắt buộc TLS | `true` |
| `ADMIN_PASSWORD` | ❌ | Mật khẩu Admin (≥12 chars) | — |

### Frontend (`.env.local`)

| Biến | Bắt buộc | Mô tả | Mặc định |
|------|:--------:|-------|----------|
| `NEXT_PUBLIC_API_URL` | ✅ | URL backend API | — |

---

## 🗄️ Database Schema

### Collections

```
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│       USERS          │      │     DOCUMENTS        │      │      SUBJECTS        │
├─────────────────────┤      ├─────────────────────┤      ├─────────────────────┤
│ _id: ObjectId        │◄─────│ uploader: Ref(User)  │      │ _id: ObjectId        │
│ email: String (uniq) │      │ _id: ObjectId        │─────►│ name: String         │
│ password: String     │      │ title: String        │      │ code: String         │
│ tokenVersion: Number │      │ description: String  │      │ managingFaculty: Str │
│ fullName: String     │      │ fileUrl: String      │      └─────────────────────┘
│ avatarUrl: String    │      │ filePath: String     │               ▲
│ role: Enum           │      │ originalFileName: Str│               │
│  (USER/MOD/ADMIN)    │      │ fileType: String     │      ┌────────┴────────────┐
│ status: Enum         │      │ fileSize: Number     │      │       MAJORS         │
│  (ACTIVE/BLOCKED)    │      │ subject: Ref(Subject)│      ├─────────────────────┤
│ uploadsCount: Number │      │ status: Enum         │      │ _id: ObjectId        │
│ downloadsCount: Num  │      │  (PROCESSING/VISIBLE │      │ name: String         │
│ joinedDate: Date     │      │   /BLOCKED)          │      │ code: String         │
└─────────────────────┘      │ documentType: String │      │ description: String  │
         ▲                    │ schoolYear: String   │      │ subjects: [Ref]      │
         │                    │ thumbnailUrl: String │      └─────────────────────┘
┌────────┴────────────┐      │ thumbnailPath: String│
│        LOGS          │      │ downloadCount: Num   │      ┌─────────────────────┐
├─────────────────────┤      │ viewCount: Number    │      │    PLATFORM_STATS    │
│ _id: ObjectId        │      │ uploadDate: Date     │      ├─────────────────────┤
│ performedBy: Ref     │      └─────────────────────┘      │ _id: ObjectId        │
│ action: String       │                                    │ totalUploads: Number │
│ targetUser: Ref      │      ┌─────────────────────┐      │ totalDownloads: Num  │
│ targetDocument: Ref  │      │      REPORTS         │      │ activeUsers: Number  │
│ details: String      │      ├─────────────────────┤      └─────────────────────┘
│ createdAt: Date      │      │ _id: ObjectId        │
└─────────────────────┘      │ reporter: Ref(User)  │
                              │ document: Ref(Doc)   │
                              │ reason: String       │
                              │ status: Enum         │
                              │ createdAt: Date      │
                              └─────────────────────┘
```

### Indexes

| Collection | Index | Loại | Mục đích |
|-----------|-------|------|----------|
| `users` | `email` | Unique | Đảm bảo email không trùng |
| `users` | `role` (partial: ADMIN) | Unique Partial | Chỉ cho phép 1 Admin |
| `documents` | `uploadDate` | Descending | Sắp xếp theo ngày upload |

---

## 📡 API Reference

> Base URL: `http://localhost:8000/api`

### Authentication

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `POST` | `/auth/register` | ❌ | Đăng ký tài khoản |
| `POST` | `/auth/login` | ❌ | Đăng nhập, trả về JWT token |
| `GET` | `/auth/me` | 🔐 | Thông tin user hiện tại + permissions |
| `POST` | `/auth/forgot-password` | ❌ | Gửi email đặt lại mật khẩu |
| `POST` | `/auth/reset-password` | ❌ | Đặt lại mật khẩu bằng token |

### Users

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `GET` | `/users/me/profile` | 🔐 | Profile cá nhân |
| `PATCH` | `/users/me/profile` | 🔐 | Cập nhật profile |
| `POST` | `/users/me/change-password` | 🔐 | Đổi mật khẩu |
| `DELETE` | `/users/me/account` | 🔐 | Xóa tài khoản |
| `GET` | `/users/me/stats` | 🔐 | Thống kê cá nhân |
| `GET` | `/users/me/upload-stats` | 🔐 | Chi tiết upload stats |
| `GET` | `/users/profile/:userId` | ❌ | Profile công khai |

### Documents

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `POST` | `/documents/upload` | 🔐 | Upload tài liệu (multipart/form-data) |
| `GET` | `/documents` | ❌ | Danh sách tài liệu (phân trang, lọc, search) |
| `GET` | `/documents/my-uploads` | 🔐 | Tài liệu đã upload |
| `GET` | `/documents/:id` | ❌ | Chi tiết tài liệu |
| `GET` | `/documents/:id/preview` | ❌ | Xem trước file (inline) |
| `GET` | `/documents/:id/download` | 🔐 | Tải xuống file |
| `PATCH` | `/documents/:id` | 🔐 | Cập nhật tài liệu (owner) |
| `DELETE` | `/documents/:id` | 🔐 | Xóa tài liệu (owner / admin) |

### Admin

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `GET` | `/admin/users` | 🛡️ | Danh sách users |
| `POST` | `/admin/users/:id/block` | 🛡️ | Chặn user |
| `POST` | `/admin/users/:id/unblock` | 🛡️ | Bỏ chặn user |
| `DELETE` | `/admin/users/:id` | 👑 | Xóa user |
| `PATCH` | `/admin/users/:id/role` | 👑 | Thay đổi role |
| `POST` | `/admin/users/:id/reset-password` | 👑 | Reset password |
| `POST` | `/admin/delegate-admin/:id` | 👑 | Ủy quyền Admin |
| `GET` | `/admin/documents` | 🛡️ | Danh sách tài liệu |
| `POST` | `/admin/documents/:id/block` | 🛡️ | Chặn tài liệu |
| `POST` | `/admin/documents/:id/unblock` | 🛡️ | Bỏ chặn tài liệu |
| `DELETE` | `/admin/documents/:id` | 👑 | Xóa tài liệu |
| `CRUD` | `/admin/subjects` | 🛡️ | Quản lý môn học |
| `CRUD` | `/admin/majors` | 🛡️ | Quản lý ngành học |

### Categories (Public)

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `GET` | `/categories/subjects` | ❌ | Danh sách môn học |
| `GET` | `/categories/majors` | ❌ | Danh sách ngành học |

### Statistics

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `GET` | `/statistics/platform` | 🛡️ | Thống kê nền tảng |
| `GET` | `/statistics/uploads-over-time` | 🛡️ | Biểu đồ uploads |

### Reports

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `POST` | `/reports` | 🔐 | Tạo báo cáo tài liệu |
| `GET` | `/reports` | 🛡️ | Danh sách báo cáo |
| `PATCH` | `/reports/:id` | 🛡️ | Xử lý báo cáo |

### Logs

| Method | Endpoint | Auth | Mô tả |
|:------:|----------|:----:|-------|
| `GET` | `/logs` | 🛡️ | Logs hệ thống |

> **Chú thích:** ❌ = Public | 🔐 = JWT Required | 🛡️ = Moderator+ | 👑 = Admin only

---

## 🔒 Hệ thống phân quyền

UniShare sử dụng **Role-Based Access Control (RBAC)** với 3 vai trò phân cấp:

```
USER  ⊂  MODERATOR  ⊂  ADMIN
```

### Ma trận quyền hạn

| Permission | Code | USER | MOD | ADMIN |
|-----------|------|:----:|:---:|:-----:|
| Upload tài liệu | `documents.upload` | ✅ | ✅ | ✅ |
| Sửa tài liệu (của mình) | `documents.update_own` | ✅ | ✅ | ✅ |
| Xóa tài liệu (của mình) | `documents.delete_own` | ✅ | ✅ | ✅ |
| Tải xuống tài liệu | `documents.download` | ✅ | ✅ | ✅ |
| Tạo báo cáo | `reports.create` | ✅ | ✅ | ✅ |
| Quản lý bản nháp | `drafts.manage_own` | ✅ | ✅ | ✅ |
| Xem dashboard | `dashboard.view` | ❌ | ✅ | ✅ |
| Xem thống kê | `statistics.view` | ❌ | ✅ | ✅ |
| Xem danh sách users | `users.list` | ❌ | ✅ | ✅ |
| Kiểm duyệt users | `users.moderate` | ❌ | ✅ | ✅ |
| Xét duyệt báo cáo | `reports.review` | ❌ | ✅ | ✅ |
| Xem xét tài liệu | `documents.review` | ❌ | ✅ | ✅ |
| Kiểm duyệt tài liệu | `documents.moderate` | ❌ | ✅ | ✅ |
| Reset mật khẩu người khác | `users.reset_password` | ❌ | ❌ | ✅ |
| Xóa người dùng | `users.delete` | ❌ | ❌ | ✅ |
| Gán vai trò | `users.assign_role` | ❌ | ❌ | ✅ |
| Ủy quyền Admin | `admin.delegate` | ❌ | ❌ | ✅ |
| Xóa tài liệu bất kỳ | `documents.delete_any` | ❌ | ❌ | ✅ |
| Xem audit logs | `audit.view` | ❌ | ❌ | ✅ |
| Quản lý danh mục | `catalog.manage` | ❌ | ❌ | ✅ |
| Tạo thumbnails | `documents.generate_thumbnails` | ❌ | ❌ | ✅ |

### Cơ chế hoạt động

1. **Backend**: Mỗi API endpoint được bảo vệ bởi `JwtAuthGuard` + `RolesGuard`. Quyền sở hữu được kiểm tra tại tầng service. Thiếu quyền trả **403**; thiếu phiên hợp lệ trả **401**.

2. **Frontend**: `AuthGuard` và `RoleGuard` components kiểm tra quyền trước khi render. `/api/auth/me` trả về danh sách `permissions` hiện hành để UI chỉ hiển thị chức năng tương ứng.

3. **Token Versioning**: Thay đổi vai trò có hiệu lực ngay vì JWT được đối chiếu với `tokenVersion` trong database. Tài khoản bị khóa không thể dùng token cũ.

4. **Single Admin**: Hệ thống chỉ cho phép **1 Admin** tại một thời điểm (enforced bằng MongoDB unique partial index). Admin phải ủy quyền cho Moderator trước khi xóa tài khoản.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

Các module đã có unit tests:
- `auth.service.spec.ts` — Đăng ký, đăng nhập, JWT
- `documents.service.spec.ts` — CRUD tài liệu, upload
- `users.service.spec.ts` — CRUD users, profile
- `validate-uploaded-document.spec.ts` — File validation

### Frontend E2E Tests

```bash
cd frontend

# Chạy Playwright tests
npm run test:e2e
```

---

## 🔑 Tài khoản Demo

> ⚠️ Chạy `npm run seed:admin` và `npm run seed:db` trước khi sử dụng.

| Vai trò | Email | Mật khẩu |
|:-------:|-------|----------|
| 👑 Admin | `admin@unishare.com` | *(đặt trong ADMIN_PASSWORD)* |
| 🛡️ Moderator | `mod@phenikaa.edu.vn` | `password123` |
| 👤 User | `nguyen.vana@phenikaa.edu.vn` | `password123` |

---

## 📜 Scripts hữu ích

### Backend

| Script | Lệnh | Mô tả |
|--------|-------|-------|
| Dev server | `npm run start:dev` | Chạy development server (hot-reload) |
| Production build | `npm run build` | Build TypeScript → JavaScript |
| Production start | `npm run start:prod` | Chạy production server |
| Seed Admin | `npm run seed:admin` | Tạo tài khoản Admin |
| Seed Database | `npm run seed:db` | Seed dữ liệu mẫu |
| Generate Thumbnails | `npm run generate:thumbnails` | Tạo thumbnails cho PDFs |
| Repair Demo PDFs | `npm run repair:demo-pdfs` | Sửa demo PDF files |
| Export Database | `npm run db:export` | Xuất database sang file |
| Import Database | `npm run db:import` | Nhập database từ file |
| Restore Files | `npm run db:restore-files` | Khôi phục uploaded files |
| Lint | `npm run lint` | Kiểm tra code style |
| Lint Fix | `npm run lint:fix` | Tự động sửa code style |
| Format | `npm run format` | Format code với Prettier |

### Frontend

| Script | Lệnh | Mô tả |
|--------|-------|-------|
| Dev server | `npm run dev` | Chạy development server (port 3000) |
| Production build | `npm run build` | Build Next.js production bundle |
| Production start | `npm run start` | Chạy production server |
| Lint | `npm run lint` | Kiểm tra code style |
| E2E tests | `npm run test:e2e` | Chạy Playwright E2E tests |

---

## 🤝 Đóng góp

### Quy ước Git

```bash
# Format commit message
<type>: <mô tả ngắn gọn>

# Ví dụ:
feat: thêm chức năng tìm kiếm tài liệu
fix: sửa lỗi upload file lớn hơn 100MB
docs: cập nhật README
style: format code với Prettier
refactor: tách logic upload ra service riêng
test: thêm unit test cho auth service
```

### Quy trình đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: mô tả"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 📄 Tài liệu liên quan

| Tài liệu | File | Mô tả |
|-----------|------|-------|
| Phân quyền | [`PHAN_QUYEN.md`](PHAN_QUYEN.md) | Chi tiết hệ thống phân quyền |
| Đánh giá dự án | [`backend/DANH_GIA_DU_AN.md`](backend/DANH_GIA_DU_AN.md) | Đánh giá theo rubric môn học |
| Database Tools | [`backend/database/README.md`](backend/database/README.md) | Hướng dẫn import/export database |

---

<p align="center">
  <strong>UniShare</strong> — Chia sẻ tri thức, kết nối sinh viên 🎓
</p>

<p align="center">
  Được phát triển bởi sinh viên Đại học Phenikaa<br/>
  Môn học: CSE703048 — Software Analysis and Design
</p>
