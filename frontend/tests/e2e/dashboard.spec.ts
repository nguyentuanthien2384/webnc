import { expect, test, type Page } from "@playwright/test";

const admin = {
  _id: "507f1f77bcf86cd799439011",
  fullName: "Quản trị kiểm thử",
  email: "admin@example.com",
  role: "ADMIN",
  status: "ACTIVE",
};

async function signInAs(page: Page, user: typeof admin) {
  await page.route("**/auth/me", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      userId: user._id,
      email: user.email,
      role: user.role,
      permissions: [
        "documents.upload", "documents.update_own", "documents.delete_own", "documents.download", "reports.create", "drafts.manage_own",
        ...(user.role === "USER" ? [] : ["dashboard.view", "statistics.view", "reports.review", "users.list", "users.moderate", "documents.review", "documents.moderate"]),
        ...(user.role === "ADMIN" ? ["users.reset_password", "users.delete", "users.assign_role", "admin.delegate", "documents.delete_any", "audit.view", "catalog.manage", "documents.generate_thumbnails"] : []),
      ],
    }),
  }));
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem("auth-storage", JSON.stringify({
      state: { user: storedUser, token: "test-jwt", isAuthenticated: true },
      version: 0,
    }));
  }, user);
}

async function mockDashboardData(
  page: Page,
  openReports = 0,
  onDocumentsRequest?: (url: URL) => void,
) {
  await page.route("**/statistics/platform", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      totalUploads: 1234,
      totalDownloads: 2500,
      activeUsers: 9,
      avgDlPerDoc: 2.03,
    }),
  }));
  await page.route("**/documents**", (route) => {
    const url = new URL(route.request().url());
    onDocumentsRequest?.(url);
    const sortBy = url.searchParams.get("sortBy");
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: sortBy === "downloads" || sortBy === "downloadCount" ? [] : [{
          _id: "507f1f77bcf86cd799439012",
          title: "Bài giảng kiểm thử",
          uploadDate: "2026-09-20T10:00:00.000Z",
          uploader: { _id: "507f1f77bcf86cd799439013", fullName: "Người đăng kiểm thử" },
        }],
        pagination: { total: 1, page: 1, limit: Number(url.searchParams.get("limit")), totalPages: 1 },
      }),
    });
  });
  await page.route("**/reports?**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      data: [],
      pagination: { total: openReports, page: 1, limit: 20, totalPages: openReports ? 1 : 0 },
    }),
  }));
}

test("hiển thị số liệu thật, tài liệu mới và tải lại biểu đồ khi đổi khoảng ngày", async ({ page }) => {
  await signInAs(page, admin);
  const documentQueries: URL[] = [];
  await mockDashboardData(page, 0, (url) => documentQueries.push(url));
  const requestedDays: number[] = [];
  await page.route("**/statistics/uploads-over-time**", (route) => {
    const days = Number(new URL(route.request().url()).searchParams.get("days"));
    requestedDays.push(days);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ date: "2026-09-20", count: days }]),
    });
  });

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: /Chào Quản trị kiểm thử/ })).toBeVisible();
  await expect(page.getByText("1.234", { exact: true })).toBeVisible();
  await expect(page.getByText("2.500", { exact: true })).toBeVisible();
  await expect(page.getByRole("link").filter({ hasText: "Bài giảng kiểm thử" }))
    .toHaveAttribute("href", "/document/507f1f77bcf86cd799439012");
  await expect(page.getByText("Người đăng kiểm thử")).toBeVisible();
  await expect.poll(() => documentQueries.map((url) => url.searchParams.get("sortBy"))).toEqual(
    expect.arrayContaining(["uploadDate", "downloadCount"]),
  );
  expect(documentQueries.every((url) =>
    url.searchParams.get("limit") === "5" && url.searchParams.get("page") === "1",
  )).toBe(true);

  await expect.poll(() => requestedDays).toContain(30);
  await expect(page.getByRole("button", { name: "30 ngày" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "7 ngày" }).click();
  await expect.poll(() => requestedDays).toContain(7);
  await expect(page.getByRole("button", { name: "7 ngày" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "90 ngày" }).click();
  await expect.poll(() => requestedDays).toContain(90);
  await expect(page.getByRole("button", { name: "90 ngày" })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )).toBeLessThanOrEqual(0);
});

test("lỗi tải chỉ số có thể thử lại mà không làm mất danh sách tài liệu", async ({ page }) => {
  test.setTimeout(60_000); // TanStack Query retries before exposing a failed request.
  await signInAs(page, admin);
  await mockDashboardData(page);
  await page.route("**/statistics/uploads-over-time**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([{ date: "2026-09-20", count: 1 }]),
  }));
  let failStats = true;
  await page.unroute("**/statistics/platform");
  await page.route("**/statistics/platform", (route) => route.fulfill({
    status: failStats ? 503 : 200,
    contentType: "application/json",
    body: JSON.stringify(failStats
      ? { message: "Không thể tải chỉ số" }
      : { totalUploads: 1234, totalDownloads: 2500, activeUsers: 9, avgDlPerDoc: 2.03 }),
  }));

  await page.goto("/dashboard");
  await expect(page.getByRole("link").filter({ hasText: "Bài giảng kiểm thử" })).toBeVisible();
  const retryButton = page.getByRole("button", { name: "Thử lại" });
  await expect(retryButton).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("1.234", { exact: true })).toHaveCount(0);

  failStats = false;
  await retryButton.click();
  await expect(page.getByText("1.234", { exact: true })).toBeVisible();
  await expect(page.getByRole("link").filter({ hasText: "Bài giảng kiểm thử" })).toBeVisible();
});

test("liên kết báo cáo chờ xử lý mở đúng mục trong trang quản lý", async ({ page }) => {
  await signInAs(page, admin);
  await mockDashboardData(page, 4);
  await page.route("**/statistics/uploads-over-time**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([]),
  }));

  await page.goto("/dashboard");
  const reportsLink = page.locator('a[href="/admin/manager?tab=reports"]');
  await expect(reportsLink).toBeVisible();
  await reportsLink.click();
  await expect(page).toHaveURL("http://127.0.0.1:3107/admin/manager?tab=reports");
  await expect(page.getByRole("button", { name: "Báo cáo", exact: true }))
    .toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: /Báo cáo tài liệu/ })).toBeVisible();
});

test("USER chỉ thấy dashboard và dữ liệu của chính mình", async ({ page }) => {
  await signInAs(page, { ...admin, role: "USER" });
  let platformRequests = 0;
  let reportRequests = 0;
  const requestedPeriods: string[] = [];
  await page.route("**/statistics/**", (route) => {
    platformRequests++;
    return route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Forbidden" }) });
  });
  await page.route("**/reports?**", (route) => {
    reportRequests++;
    return route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Forbidden" }) });
  });
  await page.route("**/users/me/stats", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ totalUploads: 2, totalDownloads: 7, avgDownloadsPerDoc: 3.5 }),
  }));
  await page.route("**/users/me/upload-stats?**", (route) => {
    const period = new URL(route.request().url()).searchParams.get("period") ?? "month";
    requestedPeriods.push(period);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ period, totalDocuments: 1, totalDownloads: 2, data: [{ date: "2026-09-21", count: 1 }] }),
    });
  });
  await page.route("**/documents/my-uploads?**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      data: [{ _id: "507f1f77bcf86cd799439014", title: "Tài liệu của tôi", uploadDate: "2026-09-20T10:00:00.000Z", downloadCount: 3 }],
      pagination: { total: 1, page: 1, limit: 5, totalPages: 1 },
    }),
  }));
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Hoạt động của bạn" })).toBeVisible();
  await expect(page.getByText("Lượt tải tài liệu của tôi", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/document/507f1f77bcf86cd799439014"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Số liệu tổng quan" })).toHaveCount(0);
  await expect.poll(() => requestedPeriods).toContain("month");
  await page.getByRole("button", { name: "Năm nay" }).click();
  await expect.poll(() => requestedPeriods).toContain("year");
  await expect(page.getByRole("button", { name: "Năm nay" })).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )).toBeLessThanOrEqual(0);
  expect(platformRequests).toBe(0);
  expect(reportRequests).toBe(0);
});

test("MODERATOR thấy công việc kiểm duyệt nhưng không thấy công cụ riêng của ADMIN", async ({ page }) => {
  await signInAs(page, { ...admin, role: "MODERATOR" });
  await mockDashboardData(page, 2);
  await page.route("**/statistics/uploads-over-time**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([{ date: "2026-09-21", count: 1 }]),
  }));

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Số liệu tổng quan" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Xử lý báo cáo/ })).toHaveAttribute("href", "/admin/manager?tab=reports");
  await expect(page.getByRole("heading", { name: "Quản trị nền tảng" })).toHaveCount(0);
  await expect(page.locator('a[href="/admin/manager?tab=logs"]')).toHaveCount(0);
});
