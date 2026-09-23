import { expect, test } from "@playwright/test";
import ExcelJS from "exceljs";

const admin = {
  _id: "507f1f77bcf86cd799439011",
  fullName: "Quản trị viên",
  email: "admin@example.com",
  role: "ADMIN",
  status: "ACTIVE",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      permissions: ["dashboard.view", "statistics.view", "reports.review", "users.list", "users.moderate", "documents.review", "documents.moderate", "users.reset_password", "users.delete", "users.assign_role", "admin.delegate", "documents.delete_any", "documents.generate_thumbnails", "audit.view", "catalog.manage"],
    }),
  }));
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem("auth-storage", JSON.stringify({
      state: { user: storedUser, token: "test-jwt", isAuthenticated: true },
      version: 0,
    }));
  }, admin);
});

test("xuất thống kê Excel theo khoảng ngày đang chọn", async ({ page }) => {
  await page.route("**/statistics/platform", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ totalUploads: 12, totalDownloads: 45, activeUsers: 7, avgDlPerDoc: 3.75 }),
  }));
  await page.route("**/statistics/uploads-over-time**", (route) => {
    const days = Number(new URL(route.request().url()).searchParams.get("days"));
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(days === 7
        ? [{ date: "2026-09-21", count: 4 }]
        : [{ date: "2026-09-01", count: 2 }]),
    });
  });

  await page.goto("/statistics");
  await page.getByRole("button", { name: "7 ngày" }).click();
  const exportButton = page.getByRole("button", { name: "Xuất Excel" });
  await expect(exportButton).toBeEnabled();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportButton.click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^unishare-statistics-7d-\d{4}-\d{2}-\d{2}\.xlsx$/);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(await download.path());
  expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(["Tổng quan", "Tải lên 7 ngày"]);
  expect(workbook.getWorksheet("Tổng quan")?.getCell("B2").value).toBe(12);
  expect(workbook.getWorksheet("Tổng quan")?.getCell("B6").value).toBe(7);
  expect(workbook.getWorksheet("Tải lên 7 ngày")?.getCell("B2").value).toBe(4);
  expect(workbook.getWorksheet("Tải lên 7 ngày")?.rowCount).toBe(2);
});

test("xuất người dùng chỉ gồm trang hiện tại", async ({ page }) => {
  await page.route("**/admin/documents**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: [], pagination: { total: 0, page: 1, totalPages: 0 } }),
  }));
  await page.route("**/admin/users**", (route) => {
    const currentPage = Number(new URL(route.request().url()).searchParams.get("page"));
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [{
          _id: currentPage === 2 ? "page-two" : "page-one",
          fullName: currentPage === 2 ? "Người trang hai" : "Người trang một",
          email: currentPage === 2 ? "two@example.com" : "one@example.com",
          role: "USER",
          status: "ACTIVE",
          joinedDate: "2026-09-20T00:00:00.000Z",
          uploadsCount: currentPage === 2 ? 9 : 1,
          downloadsCount: 3,
        }],
        pagination: { total: 21, page: currentPage, totalPages: 2 },
      }),
    });
  });

  await page.goto("/admin/manager");
  await page.getByRole("button", { name: "Người dùng", exact: true }).click();
  await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByText("Người trang hai")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Xuất Excel trang này" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^unishare-users-page-2-\d{4}-\d{2}-\d{2}\.xlsx$/);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(await download.path());
  const users = workbook.getWorksheet("Người dùng");
  expect(users?.rowCount).toBe(2);
  expect(users?.getCell("A2").value).toBe("Người trang hai");
  expect(users?.getCell("E2").value).toBe(9);
});
