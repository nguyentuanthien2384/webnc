import { expect, test } from "@playwright/test";

const documentId = "507f1f77bcf86cd799439012";

const user = {
  _id: "507f1f77bcf86cd799439011",
  fullName: "Người kiểm thử",
  email: "test@example.com",
  role: "USER",
  status: "ACTIVE",
};

function createTwoPagePdf(): Buffer {
  const firstPage = "BT /F1 20 Tf 72 720 Td (Page one marker) Tj ET";
  const secondPage = "BT /F1 20 Tf 72 720 Td (Page two marker) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>",
    "<< /Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${firstPage.length} >>\nstream\n${firstPage}\nendstream`,
    "<< /Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>",
    `<< /Length ${secondPage.length} >>\nstream\n${secondPage}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storedUser) => {
    window.localStorage.setItem("auth-storage", JSON.stringify({
      state: { user: storedUser, token: "test-jwt", isAuthenticated: true },
      version: 0,
    }));
  }, user);

  await page.route(`**/documents/${documentId}`, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({
      _id: documentId,
      title: "Tài liệu PDF kiểm thử",
      description: "",
      fileUrl: "test.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
      uploader: user,
      status: "VISIBLE",
      subject: { _id: "507f1f77bcf86cd799439013", name: "Toán", code: "MATH" },
      documentType: "Bài giảng",
      schoolYear: "2025-2026",
      downloadCount: 0,
      viewCount: 0,
      uploadDate: "2026-01-01T00:00:00.000Z",
    }),
  }));
});

test("PDF hiển thị nội dung, chuyển trang và phóng to", async ({ page }) => {
  await page.route(`**/documents/${documentId}/preview`, (route) => route.fulfill({
    status: 200,
    contentType: "application/pdf",
    headers: { "access-control-allow-origin": "*" },
    body: createTwoPagePdf(),
  }));

  await page.goto(`/document/${documentId}`);
  await expect(page.getByText("Trang 1 / 2")).toBeVisible();
  await expect(page.getByText("Page one marker")).toBeVisible();
  await page.getByRole("button", { name: "Trang sau" }).click();
  await expect(page.getByText("Trang 2 / 2")).toBeVisible();
  await expect(page.getByText("Page two marker")).toBeVisible();
  await expect(page.getByRole("button", { name: "Trang sau" })).toBeDisabled();
  await page.getByRole("button", { name: "Phóng to" }).click();
  await expect(page.getByText("125%", { exact: true })).toBeVisible();
});

test("PDF lỗi có lựa chọn mở tệp riêng", async ({ page }) => {
  await page.route(`**/documents/${documentId}/preview`, (route) => route.fulfill({
    status: 404,
    contentType: "application/json",
    headers: { "access-control-allow-origin": "*" },
    body: JSON.stringify({ message: "File not found" }),
  }));

  await page.goto(`/document/${documentId}`);
  await expect(page.getByText("Không thể hiển thị tệp PDF này.")).toBeVisible();
  await expect(page.getByText("Không tải được PDF")).toBeVisible();
  await expect(page.getByRole("link", { name: "Mở tệp trong tab mới" })).toBeVisible();
});
