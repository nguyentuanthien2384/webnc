import { expect, test } from "@playwright/test";

const user = {
  _id: "507f1f77bcf86cd799439011",
  fullName: "Người kiểm thử",
  email: "test@example.com",
  role: "USER",
  status: "ACTIVE",
};

test("quên mật khẩu hiển thị kết quả chung và lỗi cấu hình SMTP", async ({ page }) => {
  let smtpConfigured = true;
  await page.route("**/auth/forgot-password", (route) =>
    route.fulfill({
      status: smtpConfigured ? 200 : 503,
      contentType: "application/json",
      body: JSON.stringify(smtpConfigured
        ? { message: "Nếu email có tài khoản hợp lệ, chúng tôi sẽ gửi liên kết đặt lại mật khẩu." }
        : { message: "Gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên." }),
    }),
  );
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByRole("button", { name: "Gửi liên kết" }).click();
  await expect(page.getByRole("status")).toContainText("Nếu email có tài khoản hợp lệ");

  smtpConfigured = false;
  await page.getByRole("button", { name: "Gửi liên kết" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Gửi email chưa được cấu hình" })).toBeVisible();
});

test("đặt lại mật khẩu kiểm tra nhập lại và báo thành công", async ({ page }) => {
  let resetRequests = 0;
  await page.route("**/auth/reset-password", async (route) => {
    resetRequests++;
    expect(route.request().postDataJSON()).toEqual({ token: "test-token", newPassword: "newpassword123" });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ message: "Đã đổi mật khẩu." }) });
  });
  await page.goto("/reset-password?token=test-token");
  await page.getByLabel("Mật khẩu mới").fill("newpassword123");
  await page.getByLabel("Nhập lại mật khẩu").fill("different123");
  await page.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "không khớp" })).toBeVisible();
  expect(resetRequests).toBe(0);

  await page.getByLabel("Nhập lại mật khẩu").fill("newpassword123");
  await page.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await expect(page.getByRole("status")).toContainText("Đã đổi mật khẩu thành công");
  expect(resetRequests).toBe(1);
});

test("đăng nhập quay lại trang được bảo vệ ban đầu", async ({ page }) => {
  const documentId = "507f1f77bcf86cd799439012";
  await page.route("**/auth/login", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ accessToken: "test-jwt", user }),
  }));
  await page.route("**/editor/drafts**", (route) => route.fulfill({
    status: route.request().url().includes("for-document") ? 404 : 200,
    contentType: "application/json",
    body: JSON.stringify(route.request().url().includes("for-document")
      ? { message: "Không tìm thấy bản nháp." }
      : { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }),
  }));

  await page.goto(`/editor?documentId=${documentId}`);
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/editor\\?documentId=${documentId}$`));
  await expect(page.getByRole("heading", { name: "Soạn thảo và chuyển JSON" })).toBeVisible();
});

test("đăng nhập không điều hướng ra trang ngoài từ tham số next", async ({ page }) => {
  await page.route("**/auth/login", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ accessToken: "test-jwt", user }),
  }));
  await page.goto("/login?next=%2F%2Fevil.example");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByText("Đăng nhập thành công!")).toBeVisible();
  await expect(page).toHaveURL("http://127.0.0.1:3107/");
});

test("từ chối ghi chú đã lưu không gắn nhầm bản nháp cục bộ vào tài liệu", async ({ page }) => {
  const documentId = "507f1f77bcf86cd799439012";
  let promptSeen = false;
  let createdPayload: Record<string, unknown> | undefined;
  page.once("dialog", async (dialog) => {
    promptSeen = true;
    await dialog.dismiss();
  });
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem("auth-storage", JSON.stringify({
      state: { user: storedUser, token: "test-jwt", isAuthenticated: true }, version: 0,
    }));
    window.localStorage.setItem(`unishare-json-editor-draft-${storedUser._id}`, JSON.stringify({
      blocks: [{ type: "paragraph", data: { text: "Nội dung cục bộ chưa lưu" } }],
    }));
  }, user);
  await page.route("**/editor/drafts**", async (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.includes("/for-document/")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        _id: "507f1f77bcf86cd799439013",
        title: "Ghi chú đã lưu",
        content: { blocks: [{ type: "paragraph", data: { text: "Nội dung máy chủ" } }] },
        sourceDocument: documentId,
        version: 0,
      }) });
    } else if (route.request().method() === "POST") {
      createdPayload = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({
        _id: "507f1f77bcf86cd799439014", version: 0, ...createdPayload,
      }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }) });
    }
  });

  await page.goto(`/editor?documentId=${documentId}`);
  await expect.poll(() => promptSeen).toBe(true);
  await expect(page.getByText("Ghi chú riêng cho")).toHaveCount(0);
  await page.getByRole("button", { name: "Lưu vào tài khoản" }).click();
  await expect.poll(() => createdPayload).toBeTruthy();
  expect(createdPayload).not.toHaveProperty("sourceDocumentId");
});

test("bản nháp có thể mở lại và lưu bản sao khi xung đột", async ({ page }) => {
  const id = "507f1f77bcf86cd799439013";
  const copyId = "507f1f77bcf86cd799439014";
  const drafts: Array<Record<string, unknown>> = [];
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem("auth-storage", JSON.stringify({
      state: { user: storedUser, token: "test-jwt", isAuthenticated: true },
      version: 0,
    }));
  }, user);
  await page.route("**/editor/drafts**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/editor/drafts") && route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
        data: drafts.map(({ _id, title, version, updatedAt }) => ({ _id, title, version, updatedAt })),
        pagination: { page: 1, limit: 20, total: drafts.length, totalPages: drafts.length ? 1 : 0 },
      }) });
    } else if (url.pathname.endsWith("/editor/drafts") && route.request().method() === "POST") {
      const payload = route.request().postDataJSON();
      expect(payload.content.blocks.length).toBeGreaterThan(0);
      const draft = { _id: drafts.length ? copyId : id, version: 0, updatedAt: new Date().toISOString(), ...payload };
      drafts.unshift(draft);
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(draft) });
    } else if (url.pathname.endsWith(`/editor/drafts/${id}`) && route.request().method() === "PATCH") {
      await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ message: "Bản nháp đã thay đổi ở nơi khác." }) });
    } else if (url.pathname.endsWith(`/editor/drafts/${id}`) && drafts.length) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(drafts.find((draft) => draft._id === id)) });
    } else {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ message: "Không tìm thấy bản nháp." }) });
    }
  });

  await page.goto("/editor");
  await page.getByLabel("Tên bản nháp").fill("Ghi chú kiểm thử");
  await page.getByRole("button", { name: "Lưu vào tài khoản" }).click();
  await expect(page.getByRole("button", { name: "Ghi chú kiểm thử" })).toBeVisible();
  expect(drafts[0].title).toBe("Ghi chú kiểm thử");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Bản nháp mới" }).click();
  await expect(page.getByLabel("Tên bản nháp")).toHaveValue("Bản nháp mới");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Ghi chú kiểm thử" }).click();
  await expect(page.getByLabel("Tên bản nháp")).toHaveValue("Ghi chú kiểm thử");

  await page.getByRole("button", { name: "Lưu vào tài khoản" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "đã được sửa ở nơi khác" })).toBeVisible();
  await page.getByRole("button", { name: "Lưu thành bản sao" }).click();
  await expect(page.getByLabel("Tên bản nháp")).toHaveValue("Ghi chú kiểm thử (bản sao)");
  expect(drafts).toHaveLength(2);
  expect(drafts[0]).not.toHaveProperty("sourceDocumentId");
});
