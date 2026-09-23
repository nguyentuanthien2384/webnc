export type ExcelCell = string | number | Date | null | undefined;

export interface ExcelSheet {
  name: string;
  headers: string[];
  rows: ExcelCell[][];
  widths?: number[];
  /** One-based column indexes, using Excel number format strings. */
  formats?: Record<number, string>;
}

/** Build the workbook only when the user requests a download. */
export async function downloadExcel(fileName: string, sheets: ExcelSheet[]) {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "UniShare";
  workbook.created = new Date();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name, {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    worksheet.columns = sheet.headers.map((_, index) => ({
      width: sheet.widths?.[index] ?? 20,
    }));
    worksheet.addRow(sheet.headers);
    for (const row of sheet.rows) worksheet.addRow(row);

    const header = worksheet.getRow(1);
    header.height = 25;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };
      cell.alignment = { vertical: "middle" };
    });
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: sheet.headers.length },
    };
    for (const [column, format] of Object.entries(sheet.formats ?? {})) {
      worksheet.getColumn(Number(column)).numFmt = format;
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const bytes = new Uint8Array(buffer.byteLength);
  bytes.set(new Uint8Array(buffer));
  const blob = new Blob([bytes.buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
