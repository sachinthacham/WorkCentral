import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'test', 
        pass: 'test',
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `http://localhost:3001/reset-password?token=${resetToken}`;
    try {
      const info = await this.transporter.sendMail({
        from: '"Workspace App" <no-reply@workspace.com>',
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
        from: '"Workspace App" <no-reply@workspace.com>',
        to: email,
        subject: `Invitation to join ${workspaceName}`,
        html: `
          <h3>You have been invited!</h3>
          <p>You have been invited to join the workspace <strong>${workspaceName}</strong> as a <strong>${role}</strong>.</p>
          <a href="http://localhost:3000/invite?email=${email}">Click here to accept</a>
        `,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (err) {
      this.logger.error('Failed to send email', err);
    }
  }
}
