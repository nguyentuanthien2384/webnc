import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { User, UserRole, UserStatus } from './schemas/user.schema';
import { Document } from '../documents/schemas/document.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LogsService } from '../logs/logs.service';
import { StatisticsService } from '../statistics/statistics.service';
import * as bcrypt from 'bcrypt';
import { deleteDocumentFiles } from '../common/document-storage';

const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

function assertCalendarDate(value: string): void {
  const date = new Date(`${value}T00:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new BadRequestException(
      'Ngày không hợp lệ. Dùng định dạng YYYY-MM-DD.',
    );
  }
}

function nextCalendarDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function vietnamDayStart(value: string): Date {
  return new Date(
    new Date(`${value}T00:00:00Z`).getTime() - VIETNAM_UTC_OFFSET_MS,
  );
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Document.name) private documentModel: Model<Document>,
    @InjectConnection() private connection: Connection,
    private logsService: LogsService,
    private statisticsService: StatisticsService,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updateProfileDto, { new: true })
      .select('-password');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    const changedFields = Object.keys(updateProfileDto).join(', ');
    await this.logsService.createLog(
      userId,
      'UPDATE_PROFILE',
      userId,
      `Cập nhật thông tin cá nhân: ${changedFields}`,
    );

    return updatedUser;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    await this.logsService.createLog(
      userId,
      'CHANGE_PASSWORD',
      userId,
      `Đổi mật khẩu thành công`,
    );

    return this.userModel
      .findById(userId)
      .select('-password')
      .exec() as Promise<User>;
  }

  async incrementUploadCount(userId: string, amount: number = 1) {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { uploadsCount: amount } },
    );
  }

  async revokeSessions(userId: string): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { tokenVersion: 1 } },
    );
  }

  async incrementTotalDownloads(userId: string, amount: number = 1) {
    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { downloadsCount: amount } },
    );
  }

  async deleteOwnAccount(
    userId: string,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException(
        'Admin phải ủy quyền cho người khác trước khi xóa tài khoản',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    const files = await this.documentModel
      .find({ uploader: userId })
      .select('filePath fileUrl thumbnailUrl thumbnailPath')
      .exec();
    const deletedDocs = await this.documentModel.deleteMany({
      uploader: userId,
    });
    await this.logsService.createLog(
      userId,
      'DELETE_OWN_ACCOUNT',
      userId,
      `Xóa tài khoản ${user.fullName} (${user.email}) và toàn bộ tài liệu`,
    );
    await this.userModel.findByIdAndDelete(userId);
    await this.connection
      .collection('editor_drafts')
      .deleteMany({ owner: user._id });
    await this.connection
      .collection('password_reset_tokens')
      .deleteMany({ user: user._id });
    await Promise.all(files.map((doc) => deleteDocumentFiles(doc)));
    if (user.status === UserStatus.ACTIVE) {
      await this.statisticsService.incrementActiveUsers(-1);
    }
    await this.statisticsService.incrementTotalUploads(
      -deletedDocs.deletedCount,
    );
    return { message: 'Tài khoản và toàn bộ tài liệu đã được xóa thành công' };
  }

  async getMyStats(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const userStats = await this.userModel
      .findById(userId)
      .select('downloadsCount')
      .lean();

    if (!userStats) {
      throw new NotFoundException('User not found');
    }

    const documentTotals = await this.documentModel.aggregate<{
      totalUploads: number;
      currentDocumentDownloads: number;
    }>([
      { $match: { uploader: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          currentDocumentDownloads: {
            $sum: { $ifNull: ['$downloadCount', 0] },
          },
        },
      },
    ]);
    const totalUploads = documentTotals[0]?.totalUploads ?? 0;
    const avgDownloads =
      totalUploads > 0
        ? (documentTotals[0]?.currentDocumentDownloads ?? 0) / totalUploads
        : 0;

    return {
      totalUploads,
      totalDownloads: userStats.downloadsCount ?? 0,
      avgDownloadsPerDoc: parseFloat(avgDownloads.toFixed(2)),
    };
  }

  async getMyUploadStats(
    userId: string,
    period: string = 'all',
    fromDate?: string,
    toDate?: string,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    if (!['day', 'month', 'year', 'all', 'custom'].includes(period)) {
      throw new BadRequestException('Kỳ thống kê không hợp lệ.');
    }
    if (fromDate) assertCalendarDate(fromDate);
    if (toDate) assertCalendarDate(toDate);
    if (period !== 'custom' && (fromDate || toDate)) {
      throw new BadRequestException(
        'Chỉ kỳ tùy chọn mới nhận fromDate/toDate.',
      );
    }
    if (period === 'custom' && !fromDate) {
      throw new BadRequestException('Kỳ tùy chọn cần fromDate.');
    }

    const documentsCollection = this.connection.collection('documents');
    const userObjectId = new Types.ObjectId(userId);
    const matchStage: Record<string, unknown> = { uploader: userObjectId };
    const today = new Date(Date.now() + VIETNAM_UTC_OFFSET_MS)
      .toISOString()
      .slice(0, 10);
    let startDay: string | undefined;
    let endDay: string | undefined;
    if (period === 'day') {
      startDay = endDay = today;
    } else if (period === 'month') {
      startDay = `${today.slice(0, 7)}-01`;
      endDay = today;
    } else if (period === 'year') {
      startDay = `${today.slice(0, 4)}-01-01`;
      endDay = today;
    } else if (period === 'custom') {
      startDay = fromDate;
      endDay = toDate ?? today;
    }

    if (startDay && endDay) {
      const dayCount = Math.round(
        (new Date(`${endDay}T00:00:00Z`).getTime() -
          new Date(`${startDay}T00:00:00Z`).getTime()) /
          (24 * 60 * 60 * 1000),
      );
      if (dayCount < 0 || dayCount > 365) {
        throw new BadRequestException('Khoảng ngày phải từ 1 đến 366 ngày.');
      }
      matchStage.uploadDate = {
        $gte: vietnamDayStart(startDay),
        $lt: vietnamDayStart(nextCalendarDate(endDay)),
      };
    }

    const results = await documentsCollection
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$uploadDate',
                timezone: 'Asia/Ho_Chi_Minh',
              },
            },
            count: { $sum: 1 },
            totalDownloads: { $sum: '$downloadCount' },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: '$count',
            totalDownloads: '$totalDownloads',
          },
        },
      ])
      .toArray();

    const totalCount = results.reduce((sum, r) => sum + (r.count as number), 0);
    const totalDownloads = results.reduce(
      (sum, r) => sum + (r.totalDownloads as number),
      0,
    );

    const countsByDate = new Map(
      results.map((result) => [result.date as string, result]),
    );
    const data: typeof results = [];
    if (startDay && endDay) {
      for (let day = startDay; day <= endDay; day = nextCalendarDate(day)) {
        data.push(
          countsByDate.get(day) ?? {
            date: day,
            count: 0,
            totalDownloads: 0,
          },
        );
      }
    } else {
      data.push(...results);
    }

    return {
      period,
      totalDocuments: totalCount,
      totalDownloads,
      data,
    };
  }
}
