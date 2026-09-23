import { BadRequestException } from '@nestjs/common';
import { open } from 'node:fs/promises';
import { extname } from 'node:path';

const supportedMimeTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const compoundFileSignature = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);

export function hasAllowedDocumentNameAndMime(file: {
  originalname: string;
  mimetype: string;
}): boolean {
  const extension = extname(file.originalname).toLowerCase();
  return supportedMimeTypes[extension] === file.mimetype;
}

/** Check the stored bytes before creating a document record or thumbnail. */
export async function validateUploadedDocument(
  file: Pick<Express.Multer.File, 'path' | 'originalname' | 'mimetype'>,
): Promise<void> {
  if (!hasAllowedDocumentNameAndMime(file)) {
    throw new BadRequestException(
      'Chỉ cho phép upload file PDF, DOC hoặc DOCX đúng định dạng',
    );
  }

  const extension = extname(file.originalname).toLowerCase();
  if (extension === '.doc') {
    // file-type cannot distinguish legacy Word files from other OLE containers.
    // Check their shared CFBF header without loading a potentially large file.
    const handle = await open(file.path, 'r');
    try {
      const header = Buffer.alloc(compoundFileSignature.length);
      const { bytesRead } = await handle.read(header, 0, header.length, 0);
      if (
        bytesRead !== header.length ||
        !header.equals(compoundFileSignature)
      ) {
        throw new BadRequestException('Nội dung tệp DOC không hợp lệ');
      }
    } finally {
      await handle.close();
    }
    return;
  }

  const { fileTypeFromFile } = await import('file-type');
  const detected = await fileTypeFromFile(file.path);
  if (
    detected?.ext !== extension.slice(1) ||
    detected.mime !== supportedMimeTypes[extension]
  ) {
    throw new BadRequestException('Nội dung tệp không khớp với định dạng');
  }
}
