"use client";
import { useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import ManageSubjects from "./components/ManagerSubjects";
import ManageMajors from "./components/ManagerMajors";
import ManageUsers from "./components/ManagerUsers";
import ManageDocuments from "./components/ManagerDocuments";
import ManageLogs from "./components/ManagerLogs";
import ManageReports from "./components/ManagerReports";
import { useAuthStore } from "@/store/auth.store";
import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

type TabType = "subjects" | "majors" | "users" | "documents" | "logs" | "reports";

export default function ManagePage() {
  const [tab, setTab] = useState<TabType>("documents");
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

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
  const tabs = isAdmin ? [...baseTabs, reportTab, ...adminTabs] : [baseTabs[2], reportTab, adminTabs[0]];

  return (
    <RoleGuard allowedRoles={["ADMIN", "MODERATOR"]}>
      <main className="flex-1 bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hệ thống</h1>
            <p className="mt-1 text-gray-500">
              {isAdmin
                ? "Quản lý môn học, ngành học, tài liệu, người dùng, báo cáo và logs"
                : "Quản lý tài liệu, người dùng và báo cáo"}
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                {tabs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
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
              {tab === "subjects" && isAdmin && <ManageSubjects />}
              {tab === "majors" && isAdmin && <ManageMajors />}
              {tab === "documents" && <ManageDocuments />}
              {tab === "users" && <ManageUsers />}
              {tab === "logs" && isAdmin && <ManageLogs />}
              {tab === "reports" && <ManageReports />}
            </div>
          </div>
        </div>
      </main>
    </RoleGuard>
  );
}
