"use client";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RoleGuard from "@/components/auth/RoleGuard";
import ManageSubjects from "./components/ManagerSubjects";
import ManageMajors from "./components/ManagerMajors";
import ManageUsers from "./components/ManagerUsers";
import ManageDocuments from "./components/ManagerDocuments";
import ManageLogs from "./components/ManagerLogs";
import ManageReports from "./components/ManagerReports";
import { useAuthStore } from "@/store/auth.store";
import { hasPermission } from "@/lib/permissions";
import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

type TabType = "subjects" | "majors" | "users" | "documents" | "logs" | "reports";

function ManageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const canManageCatalog = hasPermission(user, "catalog.manage");
  const canReviewDocuments = hasPermission(user, "documents.review");
  const canReviewReports = hasPermission(user, "reports.review");
  const canListUsers = hasPermission(user, "users.list");
  const canViewAudit = hasPermission(user, "audit.view");

  const baseTabs = [
    { key: "subjects" as const, label: "Môn học", icon: BookOpenIcon },
    { key: "majors" as const, label: "Ngành học", icon: AcademicCapIcon },
    { key: "documents" as const, label: "Tài liệu", icon: DocumentTextIcon },
  ];

  const adminTabs = [
    { key: "users" as const, label: "Người dùng", icon: UsersIcon },
    { key: "logs" as const, label: "Logs hệ thống", icon: ClipboardDocumentListIcon },
  ];

  const reportTab = { key: "reports" as const, label: "Báo cáo", icon: ClipboardDocumentListIcon };
  const tabs = [
    ...(canManageCatalog ? baseTabs.slice(0, 2) : []),
    ...(canReviewDocuments ? [baseTabs[2]] : []),
    ...(canReviewReports ? [reportTab] : []),
    ...(canListUsers ? [adminTabs[0]] : []),
    ...(canViewAudit ? [adminTabs[1]] : []),
  ];
  const requestedTab = searchParams.get("tab");
  const tab: TabType | undefined = tabs.some(({ key }) => key === requestedTab)
    ? (requestedTab as TabType)
    : canReviewDocuments ? "documents" : tabs[0]?.key;

  return (
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hệ thống</h1>
            <p className="mt-1 text-gray-500">
              Các mục quản lý hiển thị theo quyền của tài khoản. Chọn một mục để xem và xử lý dữ liệu liên quan.
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => router.push(`/admin/manager?tab=${key}`)}
                    aria-current={tab === key ? "page" : undefined}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      tab === key
                        ? "border-blue-500 text-blue-600 bg-blue-50/50"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {!tab && <p role="alert" className="text-sm text-gray-600">Tài khoản hiện không có quyền quản lý mục nào.</p>}
              {tab === "subjects" && canManageCatalog && <ManageSubjects />}
              {tab === "majors" && canManageCatalog && <ManageMajors />}
              {tab === "documents" && canReviewDocuments && <ManageDocuments />}
              {tab === "users" && canListUsers && <ManageUsers />}
              {tab === "logs" && canViewAudit && <ManageLogs />}
              {tab === "reports" && canReviewReports && <ManageReports />}
            </div>
          </div>
        </div>
      </main>
  );
}

export default function ManagePage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]} requiredPermission="documents.review">
      <Suspense fallback={<main className="flex-1 bg-gray-50 p-6" role="status">Đang tải trang quản lý…</main>}>
        <ManageContent />
      </Suspense>
    </RoleGuard>
  );
}
