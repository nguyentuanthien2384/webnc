import { expect, test, type Page } from "@playwright/test";

const account = {
  _id: "507f1f77bcf86cd799439011",
  fullName: "Người kiểm thử",
  email: "role@example.com",
  role: "MODERATOR",
  status: "ACTIVE",
};

const userPermissions = [
  "documents.upload", "documents.update_own", "documents.delete_own",
  "documents.download", "reports.create", "drafts.manage_own",
];
const moderatorPermissions = [
  ...userPermissions, "dashboard.view", "statistics.view", "reports.review",
  "users.list", "users.moderate", "documents.review", "documents.moderate",
];
const adminPermissions = [
  ...moderatorPermissions, "users.reset_password", "users.delete", "users.assign_role",
  "admin.delegate", "documents.delete_any", "audit.view", "catalog.manage",
  "documents.generate_thumbnails",
];

const managedUsers = [
  { _id: "507f1f77bcf86cd799439012", fullName: "Thành viên mẫu", email: "user@example.com", role: "USER", status: "ACTIVE", uploadsCount: 2, downloadsCount: 3 },
  { _id: "507f1f77bcf86cd799439013", fullName: "Kiểm duyệt viên mẫu", email: "mod@example.com", role: "MODERATOR", status: "ACTIVE", uploadsCount: 1, downloadsCount: 2 },
  { _id: "507f1f77bcf86cd799439014", fullName: "Quản trị viên mẫu", email: "admin@example.com", role: "ADMIN", status: "ACTIVE", uploadsCount: 0, downloadsCount: 0 },
];

async function mockManagedUsers(page: Page) {
  await page.route("**/api/admin/users**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: managedUsers, pagination: { total: managedUsers.length, page: 1, totalPages: 1 } }),
  }));
}

async function setSession(page: Page, storedRole: string, currentRole = storedRole) {
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem("auth-storage", JSON.stringify({
      state: { user: storedUser, token: "test-jwt", isAuthenticated: true },
      version: 0,
    }));
  }, { ...account, role: storedRole });
  await page.route("**/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      userId: account._id,
      email: account.email,
      role: currentRole,
      permissions: currentRole === "USER" ? userPermissions : currentRole === "ADMIN" ? adminPermissions : moderatorPermissions,
    }),
  }));
}

test("MODERATOR chỉ thấy các mục kiểm duyệt và không mở được tab quản trị", async ({ page }) => {
  await setSession(page, "MODERATOR");
  await mockManagedUsers(page);
  await page.route("**/api/admin/documents**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: [], pagination: { total: 0, page: 1, totalPages: 0 } }),
  }));

  await page.goto("/admin/manager?tab=logs");
  await expect(page.getByRole("heading", { name: "Quản lý hệ thống" })).toBeVisible();
  for (const name of ["Tài liệu", "Báo cáo", "Người dùng"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
  for (const name of ["Môn học", "Ngành học", "Logs hệ thống"]) {
    await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole("button", { name: "Tài liệu", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Người dùng", exact: true }).click();
  const memberRow = page.getByRole("row", { name: /Thành viên mẫu/ });
  await expect(memberRow.getByRole("button", { name: "Khóa", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Thăng cấp" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Đặt lại mật khẩu" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Xóa tài khoản" })).toHaveCount(0);
  await expect(page.getByRole("row", { name: /Kiểm duyệt viên mẫu/ }).getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("row", { name: /Quản trị viên mẫu/ }).getByRole("button")).toHaveCount(0);
});

test("ADMIN chỉ có thao tác đúng với từng loại tài khoản", async ({ page }) => {
  await setSession(page, "ADMIN");
  await mockManagedUsers(page);
  await page.goto("/admin/manager?tab=users");
  const memberRow = page.getByRole("row", { name: /Thành viên mẫu/ });
  const moderatorRow = page.getByRole("row", { name: /Kiểm duyệt viên mẫu/ });
  const adminRow = page.getByRole("row", { name: /Quản trị viên mẫu/ });
  for (const name of ["Thăng cấp", "Khóa", "Đặt lại mật khẩu", "Xóa tài khoản"]) {
    await expect(memberRow.getByRole("button", { name, exact: true })).toBeVisible();
  }
  for (const name of ["Giáng cấp", "Ủy quyền Admin", "Đặt lại mật khẩu", "Xóa tài khoản"]) {
    await expect(moderatorRow.getByRole("button", { name, exact: true })).toBeVisible();
  }
  await expect(adminRow.getByRole("button")).toHaveCount(0);
});

test("quyền USER được cập nhật từ máy chủ trước khi hiển thị trang quản lý", async ({ page }) => {
  await setSession(page, "ADMIN", "USER");
  let privateRequests = 0;
  await page.route("**/api/admin/**", (route) => {
    privateRequests++;
    return route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Forbidden" }) });
  });
  await page.route("**/documents?**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } }),
  }));
  await page.route("**/categories/**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([]),
  }));

  await page.goto("/admin/manager?tab=users");
  await expect(page).toHaveURL("http://127.0.0.1:3107/");
  await expect(page.getByRole("heading", { name: "Quản lý hệ thống" })).toHaveCount(0);
  expect(privateRequests).toBe(0);
});
