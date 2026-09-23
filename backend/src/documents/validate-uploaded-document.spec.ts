import { BadRequestException } from '@nestjs/common';
import { mkdtemp, rmdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateUploadedDocument } from './validate-uploaded-document';

const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n');
const legacyDoc = Buffer.concat([
  Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
  Buffer.alloc(512),
]);
// Small OOXML ZIP containing [Content_Types].xml and word/document.xml.
const docx = Buffer.from(
  'UEsDBBQAAAAAAMqFN10IhmUzagAAAGoAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbDxPdmVycmlkZSBDb250ZW50VHlwZT0iYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQubWFpbit4bWwiLz5QSwMEFAAAAAAAyoU3XV9b0UwLAAAACwAAABEAAAB3b3JkL2RvY3VtZW50LnhtbDxkb2N1bWVudC8+UEsBAhQAFAAAAAAAyoU3XQiGZTNqAAAAagAAABMAAAAAAAAAAAAAAIABAAAAAFtDb250ZW50X1R5cGVzXS54bWxQSwECFAAUAAAAAADKhTddX1vRTAsAAAALAAAAEQAAAAAAAAAAAAAAgAGbAAAAd29yZC9kb2N1bWVudC54bWxQSwUGAAAAAAIAAgCAAAAA1QAAAAAA',
  'base64',
);

describe('validateUploadedDocument', () => {
  let directory: string;
  let filePath: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'unishare-upload-test-'));
    filePath = join(directory, 'uploaded-file');
  });

  afterEach(async () => {
    await rm(filePath, { force: true });
    await rmdir(directory);
  });

  async function check(originalname: string, mimetype: string, bytes: Buffer) {
    await writeFile(filePath, bytes);
    return validateUploadedDocument({ path: filePath, originalname, mimetype });
  }

  it('accepts PDF, DOCX, and legacy DOC signatures', async () => {
    await expect(
      check('notes.pdf', 'application/pdf', pdf),
    ).resolves.toBeUndefined();
    await expect(
      check(
        'notes.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        docx,
      ),
    ).resolves.toBeUndefined();
    await expect(
      check('notes.doc', 'application/msword', legacyDoc),
    ).resolves.toBeUndefined();
  });

  it('rejects a spoofed PDF and a ZIP mislabeled as DOCX', async () => {
    await expect(
      check('fake.pdf', 'application/pdf', Buffer.from('plain text')),
    ).rejects.toThrow(BadRequestException);
    await expect(
      check(
        'fake.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pdf,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a mismatched MIME type and filename extension', async () => {
    await expect(check('notes.docx', 'application/pdf', docx)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects a legacy DOC filename without its compound file header', async () => {
    await expect(check('fake.doc', 'application/msword', pdf)).rejects.toThrow(
      BadRequestException,
    );
  });
});
