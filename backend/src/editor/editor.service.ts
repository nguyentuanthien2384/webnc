import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document, DocumentStatus } from '../documents/schemas/document.schema';
import { CreateEditorDraftDto, UpdateEditorDraftDto } from './editor-draft.dto';
import { EditorDraft } from './editor-draft.schema';

@Injectable()
export class EditorService {
  constructor(
    @InjectModel(EditorDraft.name) private readonly drafts: Model<EditorDraft>,
    @InjectModel(Document.name) private readonly documents: Model<Document>,
  ) {}

  private validateContent(content: Record<string, unknown>): void {
    const blocks = content.blocks;
    if (
      !Array.isArray(blocks) ||
      blocks.length > 500 ||
      blocks.some(
        (block: unknown) =>
          typeof block !== 'object' ||
          block === null ||
          !['paragraph', 'header', 'list'].includes(
            (block as { type?: string }).type ?? '',
          ) ||
          typeof (block as { data?: unknown }).data !== 'object' ||
          (block as { data?: unknown }).data === null,
      ) ||
      Buffer.byteLength(JSON.stringify(content), 'utf8') > 200_000
    ) {
      throw new BadRequestException(
        'Nội dung bản nháp không hợp lệ hoặc quá lớn.',
      );
    }
  }

  async list(ownerId: string, page: number) {
    const limit = 20;
    const filter = { owner: new Types.ObjectId(ownerId) };
    const [data, total] = await Promise.all([
      this.drafts
        .find(filter)
        .select('-content')
        .sort({ updatedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.drafts.countDocuments(filter),
    ]);
    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async forDocument(ownerId: string, documentId: string) {
    if (!Types.ObjectId.isValid(documentId))
      throw new BadRequestException('ID tài liệu không hợp lệ.');
    const draft = await this.drafts.findOne({
      owner: ownerId,
      sourceDocument: documentId,
    });
    if (!draft) throw new NotFoundException('Không tìm thấy bản nháp.');
    return draft;
  }

  async findOne(ownerId: string, id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('ID bản nháp không hợp lệ.');
    const draft = await this.drafts.findOne({ _id: id, owner: ownerId });
    if (!draft) throw new NotFoundException('Không tìm thấy bản nháp.');
    return draft;
  }

  async create(ownerId: string, dto: CreateEditorDraftDto) {
    this.validateContent(dto.content);
    if (dto.sourceDocumentId) {
      const exists = await this.documents.exists({
        _id: dto.sourceDocumentId,
        status: DocumentStatus.VISIBLE,
      });
      if (!exists) throw new NotFoundException('Không tìm thấy tài liệu.');
    }
    try {
      return await this.drafts.create({
        owner: ownerId,
        title: dto.title.trim(),
        content: dto.content,
        ...(dto.sourceDocumentId && { sourceDocument: dto.sourceDocumentId }),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Đã có bản nháp cho tài liệu này.');
      }
      throw error;
    }
  }

  async update(ownerId: string, id: string, dto: UpdateEditorDraftDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('ID bản nháp không hợp lệ.');
    if (dto.title === undefined && dto.content === undefined)
      throw new BadRequestException('Không có nội dung để cập nhật.');
    if (dto.content) this.validateContent(dto.content);
    const draft = await this.drafts.findOneAndUpdate(
      { _id: id, owner: ownerId, version: dto.version },
      {
        $set: {
          ...(dto.title && { title: dto.title.trim() }),
          ...(dto.content && { content: dto.content }),
        },
        $inc: { version: 1 },
      },
      { returnDocument: 'after' },
    );
    if (draft) return draft;
    if (await this.drafts.exists({ _id: id, owner: ownerId })) {
      throw new ConflictException(
        'Bản nháp đã thay đổi ở nơi khác. Hãy tải lại trước khi lưu.',
      );
    }
    throw new NotFoundException('Không tìm thấy bản nháp.');
  }

  async remove(ownerId: string, id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('ID bản nháp không hợp lệ.');
    const draft = await this.drafts.findOneAndDelete({
      _id: id,
      owner: ownerId,
    });
    if (!draft) throw new NotFoundException('Không tìm thấy bản nháp.');
    return { message: 'Đã xóa bản nháp.' };
  }
}
