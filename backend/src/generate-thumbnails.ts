import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { join, relative } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { resolveUploadPath } from './common/document-storage';

dotenv.config();

const DocumentSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  filePath: String,
  fileType: String,
  thumbnailUrl: String,
  thumbnailPath: String,
});

async function generateThumbnails() {
  const dbUrl = process.env.DATABASE_URL;
  const apiUrl = process.env.API_URL || 'http://localhost:8000';

  if (!dbUrl) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
  }

  await mongoose.connect(dbUrl);
  console.log('Connected to MongoDB');

  const Document = mongoose.model('Document', DocumentSchema);
  const thumbnailDir = join(process.cwd(), 'uploads', 'thumbnails');

  if (!existsSync(thumbnailDir)) {
    mkdirSync(thumbnailDir, { recursive: true });
  }

  console.log('Thumbnail dir:', thumbnailDir);

  const docs = await Document.find({
    $or: [
      { thumbnailUrl: { $exists: false } },
      { thumbnailUrl: null },
      { thumbnailUrl: '' },
      { thumbnailUrl: /\/uploads\/thumbnails\// },
    ],
    fileType: 'application/pdf',
  });

  console.log(`Found ${docs.length} documents without thumbnails`);

  const { pdfToPng } = await import('pdf-to-png-converter');

  let success = 0;
  let failed = 0;

  for (const doc of docs) {
    const legacyThumbnail = resolveUploadPath(doc.thumbnailUrl ?? undefined);
    if (legacyThumbnail && existsSync(legacyThumbnail)) {
      await Document.findByIdAndUpdate(doc._id, {
        thumbnailPath: relative(process.cwd(), legacyThumbnail).replace(
          /\\/g,
          '/',
        ),
        thumbnailUrl: `${apiUrl}/api/documents/${String(doc._id)}/thumbnail`,
      });
      success++;
      continue;
    }
    const filePath = doc.filePath;
    if (!filePath) {
      console.log(`  [SKIP] "${doc.title}" - no filePath`);
      failed++;
      continue;
    }

    const absolutePath = join(process.cwd(), filePath);
    if (!existsSync(absolutePath)) {
      console.log(`  [SKIP] "${doc.title}" - file not found: ${absolutePath}`);
      failed++;
      continue;
    }

    const fileName = filePath.replace(/^.*[/\\]/, '').replace(/\.[^.]+$/, '');
    const pngFileName = `${fileName}.png`;

    try {
      const pages = await pdfToPng(absolutePath, {
        viewportScale: 1.5,
        pagesToProcess: [1],
        outputFolder: 'uploads/thumbnails',
        outputFileMaskFunc: () => pngFileName,
      });

      if (pages.length > 0) {
        const thumbnailPath = `uploads/thumbnails/${pngFileName}`;
        const thumbnailUrl = `${apiUrl}/api/documents/${String(doc._id)}/thumbnail`;
        await Document.findByIdAndUpdate(doc._id, {
          thumbnailUrl,
          thumbnailPath,
        });
        console.log(`  [OK] "${doc.title}" -> ${pngFileName}`);
        success++;
      } else {
        console.log(`  [FAIL] "${doc.title}" - no pages generated`);
        failed++;
      }
    } catch (err) {
      console.log(`  [FAIL] "${doc.title}" - ${err}`);
      failed++;
    }
  }

  console.log(
    `\nDone! Processed: ${docs.length}, Success: ${success}, Failed: ${failed}`,
  );
  await mongoose.disconnect();
}

generateThumbnails().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
