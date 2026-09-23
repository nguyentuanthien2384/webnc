import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Document, DocumentStatus } from '../documents/schemas/document.schema';
import { User, UserRole, UserStatus } from '../users/schemas/user.schema';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { LogsService } from '../logs/logs.service';
import { StatisticsService } from '../statistics/statistics.service';
import { Subject } from '../subjects/schemas/subject.schema';
import { Major } from '../majors/schemas/major.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { GetDocumentsQueryDto } from '../documents/dto/get-documents-query.dto';
import { deleteDocumentFiles } from '../common/document-storage';

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface UserAggregateResult {
  data: User[];
  total: Array<{ count: number }>;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Document.name) private documentModel: Model<Document>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(Major.name) private majorModel: Model<Major>,
    private logsService: LogsService,
    private statisticsService: StatisticsService,
  ) {}

  private async updateUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private assertCanModerateUser(
    targetUser: User,
    actorId: string,
    actorRole: UserRole,
  ) {
    if (![UserRole.ADMIN, UserRole.MODERATOR].includes(actorRole)) {
      throw new ForbiddenException('Bạn không có quyền quản lý người dùng');
    }
    if (
      String(targetUser._id) === actorId ||
      targetUser.role !== UserRole.USER
    ) {
      throw new ForbiddenException(
        'Chỉ có thể khóa hoặc mở khóa tài khoản User khác',
      );
    }
  }

  async blockUser(
    userId: string,
    actorId: string,
    actorRole: UserRole = UserRole.ADMIN,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    this.assertCanModerateUser(user, actorId, actorRole);
    if (user.status === UserStatus.BLOCKED) {
      throw new BadRequestException('User is already blocked');
    }
    await this.statisticsService.incrementActiveUsers(-1);
    const result = await this.updateUserStatus(userId, UserStatus.BLOCKED);
    await this.logsService.createLog(
      actorId,
      'BLOCK_USER',
      userId,
      `Block user ${user.fullName} (${user.email})`,
    );
    return result;
  }

  async unblockUser(
    userId: string,
    actorId: string,
    actorRole: UserRole = UserRole.ADMIN,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    this.assertCanModerateUser(user, actorId, actorRole);
    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('User is already active');
    }
    await this.statisticsService.incrementActiveUsers(1);
    const result = await this.updateUserStatus(userId, UserStatus.ACTIVE);
    await this.logsService.createLog(
      actorId,
      'UNBLOCK_USER',
      userId,
      `Bỏ block user ${user.fullName} (${user.email})`,
    );
    return result;
  }

  async blockDocument(docId: string, actorId: string): Promise<Document> {
    const doc = await this.documentModel
      .findById(docId)
      .populate('uploader', 'fullName email');
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.status === DocumentStatus.BLOCKED) {
      throw new BadRequestException('Document is already blocked');
    }
    const uploaderInfo = doc.uploader as unknown as {
      fullName: string;
      email: string;
    };
    const result = await this.updateDocumentStatus(
      docId,
      DocumentStatus.BLOCKED,
    );
    await this.logsService.createLog(
      actorId,
      'BLOCK_DOCUMENT',
      docId,
      `Block tài liệu "${doc.title}" của ${uploaderInfo?.fullName || 'N/A'}`,
    );
    return result;
  }

  async unblockDocument(docId: string, actorId: string): Promise<Document> {
    const doc = await this.documentModel
      .findById(docId)
      .populate('uploader', 'fullName email');
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.status !== DocumentStatus.BLOCKED) {
      throw new BadRequestException('Document is not blocked');
    }
    const uploaderInfo = doc.uploader as unknown as {
      fullName: string;
      email: string;
    };
    const result = await this.updateDocumentStatus(
      docId,
      DocumentStatus.VISIBLE,
    );
    await this.logsService.createLog(
      actorId,
      'UNBLOCK_DOCUMENT',
      docId,
      `Bỏ block tài liệu "${doc.title}" của ${uploaderInfo?.fullName || 'N/A'}`,
    );
    return result;
  }

  private async updateDocumentStatus(
    docId: string,
    status: DocumentStatus,
  ): Promise<Document> {
    const doc = await this.documentModel.findByIdAndUpdate(
      docId,
      { status },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async deleteUser(
    userId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    if (userId === actorId || user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Không thể xóa tài khoản Admin');
    }
    const files = await this.documentModel
      .find({ uploader: userId })
      .select('filePath fileUrl thumbnailUrl thumbnailPath')
      .exec();
    const deletedDocs = await this.documentModel.deleteMany({
      uploader: userId,
    });
    const deletedUser = await this.userModel.findByIdAndDelete(userId);
    if (!deletedUser) throw new NotFoundException('User not found');
    await Promise.all(files.map((doc) => deleteDocumentFiles(doc)));
    if (user.status === UserStatus.ACTIVE) {
      await this.statisticsService.incrementActiveUsers(-1);
    }
    await this.statisticsService.incrementTotalUploads(
      -deletedDocs.deletedCount,
    );
    await this.logsService.createLog(
      actorId,
      'DELETE_USER',
      userId,
      `Xóa user ${user.email} và ${deletedDocs.deletedCount} tài liệu`,
    );
    return { message: 'User và toàn bộ tài liệu đã được xóa thành công' };
  }

  async deleteDocument(
    docId: string,
    actorId: string,
  ): Promise<{ message: string }> {
    const doc = await this.documentModel
      .findById(docId)
      .populate('uploader', 'fullName email');
    if (!doc) throw new NotFoundException('Document not found');
    const uploaderInfo = doc.uploader as unknown as {
      fullName: string;
      email: string;
    };
    const title = doc.title;
    await doc.deleteOne();
    await deleteDocumentFiles(doc);
    if (doc.uploader) {
      await this.userModel.updateOne(
        { _id: doc.uploader._id },
        { $inc: { uploadsCount: -1 } },
      );
    }
    await this.statisticsService.incrementTotalUploads(-1);
    await this.logsService.createLog(
      actorId,
      'DELETE_DOCUMENT',
      docId,
      `Xóa tài liệu "${title}" của ${uploaderInfo?.fullName || 'N/A'}`,
    );
    return { message: 'Document deleted successfully' };
  }

  async setUserRole(
    userId: string,
    role: UserRole,
    actorId: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (userId === actorId || user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Không thể thay đổi vai trò của Admin');
    }
    if (![UserRole.USER, UserRole.MODERATOR].includes(role)) {
      throw new BadRequestException(
        'Admin chỉ được tạo bằng chức năng ủy quyền',
      );
    }
    if (user.role === role) {
      throw new BadRequestException('User đã có vai trò này');
    }

    const oldRole = user.role;
    let action: string;
    let detail: string;

    if (oldRole === UserRole.USER && role === UserRole.MODERATOR) {
      action = 'PROMOTE_USER';
      detail = `Thăng cấp ${user.fullName} (${user.email}) từ USER lên MODERATOR`;
    } else if (oldRole === UserRole.MODERATOR && role === UserRole.USER) {
      action = 'DEMOTE_MODERATOR';
      detail = `Giáng cấp ${user.fullName} (${user.email}) từ MODERATOR xuống USER`;
    } else {
      action = 'CHANGE_ROLE';
      detail = `Đổi role ${user.fullName} (${user.email}) từ ${oldRole} thành ${role}`;
    }

    user.role = role;
    await user.save();

    await this.logsService.createLog(actorId, action, userId, detail);
    return user;
  }

  async getUsers(queryDto: GetUsersQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'joinedDate',
      sortOrder = 'desc',
      role,
    } = queryDto;

    const skip = (page - 1) * limit;
    const sortValue: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
    const safeSearch = search ? escapeRegex(search.trim()) : undefined;

    if (sortBy === 'totalDocDownloads') {
      const matchStage: Record<string, unknown> = {};
      if (safeSearch) {
        matchStage.$or = [
          { fullName: { $regex: safeSearch, $options: 'i' } },
          { email: { $regex: safeSearch, $options: 'i' } },
        ];
      }
      if (role) matchStage.role = role;

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'documents',
            localField: '_id',
            foreignField: 'uploader',
            as: 'userDocuments',
          },
        },
        {
          $addFields: {
            totalDocDownloads: { $sum: '$userDocuments.downloadCount' },
          },
        },
        { $project: { password: 0, userDocuments: 0 } },
        { $sort: { totalDocDownloads: sortValue } },
        {
          $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ];

      const [result] = await this.userModel
        .aggregate<UserAggregateResult>(pipeline)
        .exec();
      const users = result?.data ?? [];
      const totalUsers = result?.total[0]?.count ?? 0;

      return {
        data: users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      };
    }

    const query: Record<string, unknown> = {};

    if (safeSearch) {
      query.$or = [
        { fullName: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (role) query.role = role;

    const sortField = sortBy === 'downloads' ? 'downloadsCount' : sortBy;
    const sortOptions: Record<string, 1 | -1> = {
      [sortField]: sortValue,
    };

    const [users, totalUsers] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(query),
    ]);

    return {
      data: users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  }

  async resetPassword(
    userId: string,
    actorId: string,
  ): Promise<{ message: string; newPassword?: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const newPassword = randomBytes(12).toString('base64url');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    await this.logsService.createLog(
      actorId,
      'RESET_PASSWORD',
      userId,
      `Reset mật khẩu cho ${user.email}`,
    );

    return {
      message: `Đã reset mật khẩu cho ${user.email} thành công.`,
      newPassword,
    };
  }

  async createSubject(createSubjectDto: CreateSubjectDto, actorId?: string) {
    const existing = await this.subjectModel.findOne({
      $or: [{ code: createSubjectDto.code }, { name: createSubjectDto.name }],
    });
    if (existing) {
      throw new ConflictException('Subject code or name already exists');
    }
    const newSubject = new this.subjectModel(createSubjectDto);
    const saved = await newSubject.save();
    if (actorId) {
      await this.logsService.createLog(
        actorId,
        'CREATE_SUBJECT',
        String(saved._id),
        `Tạo môn học "${saved.name}" (${saved.code})`,
      );
    }
    return saved;
  }

  async findAllSubjects() {
    return this.subjectModel.find().sort({ name: 1 }).exec();
  }

  async updateSubject(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
    actorId?: string,
  ) {
    const oldSubject = await this.subjectModel.findById(id);
    if (!oldSubject) throw new NotFoundException('Subject not found');
    const oldName = oldSubject.name;
    const subject = await this.subjectModel.findByIdAndUpdate(
      id,
      updateSubjectDto,
      { new: true },
    );
    if (!subject) throw new NotFoundException('Subject not found');
    if (actorId) {
      await this.logsService.createLog(
        actorId,
        'UPDATE_SUBJECT',
        id,
        `Cập nhật môn học "${oldName}" → "${subject.name}" (${subject.code})`,
      );
    }
    return subject;
  }

  async removeSubject(id: string, actorId?: string) {
    const subject = await this.subjectModel.findByIdAndDelete(id);
    if (!subject) throw new NotFoundException('Subject not found');
    if (actorId) {
      await this.logsService.createLog(
        actorId,
        'DELETE_SUBJECT',
        id,
        `Xóa môn học "${subject.name}" (${subject.code})`,
      );
    }
    return { message: 'Subject deleted successfully' };
  }

  async createMajor(createMajorDto: CreateMajorDto, actorId?: string) {
    const existing = await this.majorModel.findOne({
      name: createMajorDto.name,
    });
    if (existing) {
      throw new ConflictException('Major name already exists');
    }
    const newMajor = new this.majorModel(createMajorDto);
    const saved = await newMajor.save();
    if (actorId) {
      await this.logsService.createLog(
        actorId,
        'CREATE_MAJOR',
        String(saved._id),
        `Tạo ngành học "${saved.name}"`,
      );
    }
    return saved;
  }

  async findAllMajors() {
    return this.majorModel
      .find()
      .populate('subjects', 'name code managingFaculty')
      .sort({ name: 1 })
      .exec();
  }

  async updateMajor(
    id: string,
    updateMajorDto: UpdateMajorDto,
    actorId?: string,
  ) {
    const oldMajor = await this.majorModel.findById(id);
    if (!oldMajor) throw new NotFoundException('Major not found');
    const oldName = oldMajor.name;
    const major = await this.majorModel.findByIdAndUpdate(id, updateMajorDto, {
      new: true,
    });
    if (!major) throw new NotFoundException('Major not found');
    if (actorId) {
      await this.logsService.createLog(
        actorId,
        'UPDATE_MAJOR',
        id,
        `Cập nhật ngành học "${oldName}" → "${major.name}"`,
      );
    }
    return major;
  }

  async removeMajor(id: string, actorId?: string) {
    const major = await this.majorModel.findByIdAndDelete(id);
    if (!major) throw new NotFoundException('Major not found');
    if (actorId) {
      await this.logsService.createLog(
        actorId,
        'DELETE_MAJOR',
        id,
        `Xóa ngành học "${major.name}"`,
      );
    }
    return { message: 'Major deleted successfully' };
  }

  async delegateAdmin(targetUserId: string, actorId: string): Promise<User> {
    if (targetUserId === actorId) {
      throw new BadRequestException('Không thể ủy quyền cho chính mình');
    }

    const targetUser = await this.userModel.findById(targetUserId);
    if (!targetUser) throw new NotFoundException('User not found');

    if (targetUser.role !== UserRole.MODERATOR) {
      throw new ForbiddenException('Chỉ có thể ủy quyền Admin cho Moderator');
    }

    const currentAdmin = await this.userModel.findById(actorId);
    if (!currentAdmin || currentAdmin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Chỉ Admin hiện tại mới có thể ủy quyền');
    }
    if (
      currentAdmin.status !== UserStatus.ACTIVE ||
      targetUser.status !== UserStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Chỉ có thể ủy quyền cho tài khoản đang hoạt động',
      );
    }

    await this.userModel.findByIdAndUpdate(actorId, {
      role: UserRole.MODERATOR,
    });

    let newAdmin: User | null;
    try {
      newAdmin = await this.userModel.findByIdAndUpdate(
        targetUserId,
        { role: UserRole.ADMIN },
        { new: true },
      );
      if (!newAdmin) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      // Khôi phục quyền cũ nếu bước chuyển giao thứ hai gặp lỗi để hệ thống
      // không rơi vào trạng thái không có Admin.
      await this.userModel.findByIdAndUpdate(actorId, {
        role: UserRole.ADMIN,
      });
      throw error;
    }

    await this.logsService.createLog(
      actorId,
      'DELEGATE_ADMIN',
      targetUserId,
      `Ủy quyền Admin cho ${targetUser.fullName}`,
    );

    return newAdmin;
  }

  async getDocumentsAdmin(queryDto: GetDocumentsQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'uploadDate',
      sortOrder = 'desc',
    } = queryDto;

    const query: Record<string, unknown> = {};

    if (search?.trim()) {
      query.title = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    const sortField = ['downloads', 'downloadCount'].includes(sortBy)
      ? 'downloadCount'
      : 'uploadDate';
    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = {
      [sortField]: sortOrderValue,
    };

    const skip = (page - 1) * limit;
    const [documents, totalDocuments] = await Promise.all([
      this.documentModel
        .find(query)
        .populate('uploader', 'fullName email')
        .populate('subject', 'name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.documentModel.countDocuments(query),
    ]);

    return {
      data: documents,
      pagination: {
        total: totalDocuments,
        page,
        limit,
        totalPages: Math.ceil(totalDocuments / limit),
      },
    };
  }
}
