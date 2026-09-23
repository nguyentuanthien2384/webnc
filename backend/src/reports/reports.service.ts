import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from './report.schema';
import { Document, DocumentStatus } from '../documents/schemas/document.schema';
import {
  CreateReportDto,
  ReportQueryDto,
  ResolveReportDto,
} from './report.dto';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reports: Model<Report>,
    @InjectModel(Document.name) private documents: Model<Document>,
    private logs: LogsService,
  ) {}

  async create(dto: CreateReportDto, reporter: string) {
    if (
      !(await this.documents.exists({
        _id: dto.documentId,
        status: DocumentStatus.VISIBLE,
      }))
    ) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }
    try {
      const report = await this.reports.create({
        document: dto.documentId,
        reporter,
        reason: dto.reason,
      });
      await this.logs.createLog(
        reporter,
        'REPORT_DOCUMENT',
        dto.documentId,
        'Báo cáo tài liệu',
      );
      return {
        id: String(report._id),
        message: 'Đã gửi báo cáo đến quản trị viên.',
      };
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException(
          'Bạn đã có báo cáo đang chờ xử lý cho tài liệu này.',
        );
      }
      throw error;
    }
  }

  async findAll(query: ReportQueryDto) {
    const filter = query.status ? { status: query.status } : {};
    const limit = 20;
    const [data, total] = await Promise.all([
      this.reports
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((query.page - 1) * limit)
        .limit(limit)
        .populate('document', 'title status')
        .populate('reporter', 'fullName email')
        .populate('resolvedBy', 'fullName')
        .lean()
        .exec(),
      this.reports.countDocuments(filter),
    ]);
    return {
      data,
      pagination: {
        total,
        page: query.page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async resolve(id: string, dto: ResolveReportDto, actor: string) {
    const report = await this.reports.findOneAndUpdate(
      { _id: id, status: 'OPEN' },
      {
        status: dto.status,
        resolvedBy: actor,
        resolvedAt: new Date(),
      },
      { new: true },
    );
    if (!report)
      throw new NotFoundException('Báo cáo không tồn tại hoặc đã được xử lý.');
    await this.logs.createLog(
      actor,
      'RESOLVE_REPORT',
      String(report.document),
      `Xử lý báo cáo: ${dto.status}`,
    );
    return { message: 'Đã cập nhật báo cáo.' };
  }
}
