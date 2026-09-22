import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Log } from './schemas/log.schema';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';

// Các action mà targetId trỏ tới một tài liệu.
const DOCUMENT_ACTIONS = new Set([
  'BLOCK_DOCUMENT',
  'UNBLOCK_DOCUMENT',
  'DELETE_DOCUMENT',
  'DELETE_OWN_DOCUMENT',
  'UPLOAD_DOCUMENT',
  'DOWNLOAD_DOCUMENT',
  'UPDATE_DOCUMENT',
  'REPORT_DOCUMENT',
  'RESOLVE_REPORT',
]);

// Các action mà targetId trỏ tới môn học / ngành học: không gắn ref nào,
// thông tin đã nằm trong details.
const UNLINKED_ACTIONS = new Set([
  'CREATE_SUBJECT',
  'UPDATE_SUBJECT',
  'DELETE_SUBJECT',
  'CREATE_MAJOR',
  'UPDATE_MAJOR',
  'DELETE_MAJOR',
]);

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

  async createLog(
    performedById: string,
    action: string,
    targetId?: string,
    details?: string,
  ): Promise<void> {
    try {
      const entry: Record<string, unknown> = {
        performedBy: new Types.ObjectId(performedById),
        action,
        details,
      };

      if (targetId && !UNLINKED_ACTIONS.has(action)) {
        const target = new Types.ObjectId(targetId);
        if (DOCUMENT_ACTIONS.has(action)) {
          entry.targetDocument = target;
        } else {
          entry.targetUser = target;
        }
      }

      await this.logModel.create(entry);
    } catch (error) {
      // Ghi audit log không được làm hỏng nghiệp vụ chính đã thực hiện xong.
      this.logger.error(
        `Không ghi được log "${action}" của ${performedById}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async findAll(queryDto: GetLogsQueryDto) {
    const { action, page = 1, limit = 20 } = queryDto;

    const filter: Record<string, unknown> = {};
    if (action) {
      filter.action = action;
    }

    const [data, total] = await Promise.all([
      this.logModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('performedBy', 'fullName email')
        .populate('targetUser', 'fullName')
        .populate('targetDocument', 'title')
        .lean()
        .exec(),
      this.logModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
