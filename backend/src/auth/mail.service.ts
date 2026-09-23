import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = Number(config.get<string>('SMTP_PORT') || '587');
    const from = config.get<string>('SMTP_FROM');
    const user = config.get<string>('SMTP_USER');
    const password = config.get<string>('SMTP_PASSWORD');
    this.from = from || '';
    this.transporter =
      host &&
      from &&
      Number.isInteger(port) &&
      port > 0 &&
      port <= 65535 &&
      ((user && password) || (!user && !password))
        ? nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            requireTLS:
              port !== 465 &&
              config.get<string>('SMTP_REQUIRE_TLS') !== 'false',
            ...(user && password ? { auth: { user, pass: password } } : {}),
          })
        : null;
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendPasswordReset(to: string, url: string): Promise<void> {
    if (!this.transporter) throw new Error('SMTP is not configured');
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Đặt lại mật khẩu UniShare',
      text: `Bạn đã yêu cầu đặt lại mật khẩu UniShare. Mở liên kết sau trong vòng 15 phút:\n\n${url}\n\nNếu không yêu cầu, hãy bỏ qua email này.`,
    });
  }
}
