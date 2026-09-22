import { Logger } from '@nestjs/common';
import { realpath, unlink } from 'fs/promises';
import { isAbsolute, relative, resolve, sep } from 'path';

const logger = new Logger('DocumentStorage');

function isWithin(root: string, target: string): boolean {
  const path = relative(root, target);
  return !!path && !isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`);
}

/** Only allow paths beneath this application's uploads directory. */
export function resolveUploadPath(value?: string): string | null {
  if (!value) return null;
  const path = value.replace(/^https?:\/\/[^/]+\//, '').replace(/\\/g, '/');
  const target = resolve(process.cwd(), path);
  return isWithin(resolve(process.cwd(), 'uploads'), target) ? target : null;
}

export async function deleteDocumentFiles(doc: {
  filePath?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}): Promise<void> {
  for (const value of new Set([doc.filePath || doc.fileUrl, doc.thumbnailUrl])) {
    const target = resolveUploadPath(value);
    if (!target) continue;
    try {
      const [root, actualTarget] = await Promise.all([
        realpath(resolve(process.cwd(), 'uploads')),
        realpath(target),
      ]);
      if (!isWithin(root, actualTarget)) continue;
      await unlink(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.warn(`Could not remove document file: ${target}`);
      }
    }
  }
}
