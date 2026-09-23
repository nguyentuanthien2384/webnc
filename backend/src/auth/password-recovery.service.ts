import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../users/schemas/user.schema';
import { PasswordResetToken } from './schemas/password-reset-token.schema';
import { MailService } from './mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

const response = {
  message:
    'Nếu email có tài khoản hợp lệ, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.',
};
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);

  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(PasswordResetToken.name)
    private readonly tokens: Model<PasswordResetToken>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async request(email: string): Promise<typeof response> {
    if (!this.mail.isConfigured()) {
      throw new ServiceUnavailableException(
        'Gửi email chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
      );
    }

    const user = await this.users.findOne({
      email: email.trim().toLowerCase(),
      status: UserStatus.ACTIVE,
    });
    if (!user) return response;

    const now = new Date();
    const existing = await this.tokens.findOne({ user: user._id });
    if (existing && now.getTime() - existing.requestedAt.getTime() < 60_000) {
      return response;
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);
    const frontendUrl = this.config
      .get<string>('FRONTEND_URL')
      ?.split(',')[0]
      ?.trim();
    if (!frontendUrl) {
      throw new ServiceUnavailableException(
        'Trang khôi phục mật khẩu chưa được cấu hình.',
      );
    }
    const url = new URL('/reset-password', frontendUrl);
    url.searchParams.set('token', token);

    await this.tokens.findOneAndUpdate(
      { user: new Types.ObjectId(String(user._id)) },
      {
        tokenHash,
        requestedAt: now,
        expiresAt: new Date(now.getTime() + 15 * 60_000),
      },
      { upsert: true, returnDocument: 'after' },
    );
    try {
      await this.mail.sendPasswordReset(user.email, url.toString());
    } catch {
      await this.tokens.deleteOne({ tokenHash });
      this.logger.error('Could not deliver a password reset email');
    }
    return response;
  }

  async reset(dto: ResetPasswordDto): Promise<{ message: string }> {
    const token = await this.tokens.findOneAndDelete({
      tokenHash: hashToken(dto.token),
      expiresAt: { $gt: new Date() },
    });
    if (!token)
      throw new BadRequestException('Liên kết không hợp lệ hoặc đã hết hạn.');

    const user = await this.users.findById(token.user);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Liên kết không hợp lệ hoặc đã hết hạn.');
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();
    return { message: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại.' };
  }
}
