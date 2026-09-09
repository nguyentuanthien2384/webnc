import * as dotenv from 'dotenv';
import * as fs from 'fs';
import mongoose from 'mongoose';
import * as path from 'path';

dotenv.config();

type SeedDocument = {
  _id: mongoose.Types.ObjectId;
  title: string;
  filePath: string;
};

const toAscii = (value: string) =>
  value
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();

const escapePdfText = (value: string) => value.replace(/([\\()])/g, '\\$1');

function createPdf(title: string): Buffer {
  const stream = [
    'BT',
    '/F1 18 Tf',
    '72 720 Td',
    `(${escapePdfText(toAscii(title))}) Tj`,
    '0 -32 Td',
    '/F1 12 Tf',
    '(Demo document - UniShare) Tj',
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /MediaBox [0 0 612 792] /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let index = 0; index < objects.length; index++) {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'ascii');
}

async function refreshDemoPdfs() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not defined in .env');

  await mongoose.connect(databaseUrl);
  const documents = await mongoose.connection
    .collection<SeedDocument>('documents')
    .find({ filePath: { $regex: '^uploads[/\\\\]seed-' } })
    .toArray();

  let refreshed = 0;
  for (const document of documents) {
    const absolutePath = path.join(process.cwd(), document.filePath);
    if (!fs.existsSync(absolutePath)) continue;
    fs.writeFileSync(absolutePath, createPdf(document.title));
    refreshed++;
  }

  await mongoose.disconnect();
  console.log(`Refreshed ${String(refreshed)} demo PDFs.`);
}

void refreshDemoPdfs().catch(async (error: unknown) => {
  await mongoose.disconnect();
  console.error(error);
  process.exit(1);
});
