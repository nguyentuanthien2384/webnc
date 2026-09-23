"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import {
  UserIcon,
  ArrowLeftEndOnRectangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import GlobalSearch from "./GlobalSearch";
import { hasPermission, ROLE_LABELS } from "@/lib/permissions";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const canReviewDocuments = hasPermission(user, "documents.review");
  const canViewStatistics = hasPermission(user, "statistics.view");
  const canUpload = hasPermission(user, "documents.upload");
  const canEditDrafts = hasPermission(user, "drafts.manage_own");

  const getAvatarFallback = () => {
    if (!user) return "...";
    const names = user.fullName.split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition hidden sm:block">
              UniShare
            </span>
          </Link>
        </div>

        {/* Search */}
        <GlobalSearch />

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {canReviewDocuments && (
                <Link
                  href="/admin/manager?tab=documents"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Quản lý
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <ChartBarIcon className="w-4 h-4" />
                Dashboard
              </Link>
              {canUpload && <Link
                href="/upload"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <CloudArrowUpIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </Link>}
              {canEditDrafts && <Link
                href="/editor"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <PencilSquareIcon className="w-4 h-4" />
                Soạn thảo
              </Link>}

              {/* Avatar Menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center justify-center w-9 h-9 font-semibold bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white text-sm hover:shadow-md transition">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    getAvatarFallback()
                  )}
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 w-64 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : user.role === "MODERATOR"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/dashboard"
                            className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-4 py-2.5 text-sm text-gray-700`}
                          >
                            <ChartBarIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                      {canReviewDocuments && <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/admin/manager?tab=documents"
                            className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-4 py-2.5 text-sm text-gray-700`}
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Quản lý hệ thống
                          </Link>
                        )}
                      </Menu.Item>}
                      {canViewStatistics && <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/statistics"
                            className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-4 py-2.5 text-sm text-gray-700`}
                          >
                            <ChartBarIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Thống kê
                          </Link>
                        )}
                      </Menu.Item>}
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile/me"
                            className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-4 py-2.5 text-sm text-gray-700`}
                          >
                            <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Hồ sơ cá nhân
                          </Link>
                        )}
                      </Menu.Item>
                      {canEditDrafts && <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/editor"
                            className={`${active ? "bg-gray-50" : ""} flex items-center w-full px-4 py-2.5 text-sm text-gray-700`}
                          >
                            <PencilSquareIcon className="w-4 h-4 mr-3 text-gray-400" />
                            Soạn thảo JSON
                          </Link>
                        )}
                      </Menu.Item>}
                      <div className="h-px bg-gray-100 mx-3" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className={`${active ? "bg-red-50" : ""} flex items-center w-full px-4 py-2.5 text-sm text-red-600`}
                          >
                            <ArrowLeftEndOnRectangleIcon className="w-4 h-4 mr-3" />
                            Đăng xuất
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeftEndOnRectangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Xác nhận đăng xuất</h3>
              <p className="mt-2 text-sm text-gray-500">
                Bạn có chắc chắn muốn đăng xuất khỏi tất cả phiên đăng nhập?
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
