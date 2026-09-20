import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  /** Public URL of the frontend, used to build links inside emails. */
  private readonly appUrl = (process.env.APP_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  private readonly from = process.env.MAIL_FROM ?? '"Workspace App" <no-reply@workspace.com>';

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER ?? 'test',
        pass: process.env.SMTP_PASS ?? 'test',
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h3>Password Reset</h3>
          <p>You requested a password reset. Click the link below to set a new password.</p>
          <p>This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">Reset Password</a>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });
      this.logger.log(`Password reset email sent: ${info.messageId}`);
    } catch (err) {
      this.logger.error('Failed to send password reset email', err);
    }
  }

  async sendInvitationEmail(email: string, workspaceName: string, role: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: `Invitation to join ${workspaceName}`,
        html: `
          <h3>You have been invited!</h3>
          <p>You have been invited to join the workspace <strong>${workspaceName}</strong> as a <strong>${role}</strong>.</p>
          <a href="${this.appUrl}/invite?email=${encodeURIComponent(email)}">Click here to accept</a>
        `,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (err) {
      this.logger.error('Failed to send email', err);
    }
  }
}
