import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(data: RegisterDto) {
    const { password, ...rest } = data;
    const hashed = await bcrypt.hash(password, 10);

    try {
      const user = await this.usersService.create({
        ...rest,
        password: hashed,
      });

      return this.generateTokens(user._id.toString());
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw error;
    }
  }

  async login(data: any) {
    const user = await this.usersService.findByEmail(data.email);

    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(data.password, user.password);

    if (!valid) throw new UnauthorizedException();

    return this.generateTokens(user._id.toString());
  }

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '7d' },
    );

    await this.usersService.updateRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    // Always return the same message to avoid leaking whether the email exists
    if (!user) {
      return {
        message:
          'If an account with that email exists, a reset link has been sent.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await this.usersService.setPasswordResetToken(
      user._id.toString(),
      token,
      expiry,
    );
    await this.emailService.sendPasswordResetEmail(email, token);

    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user._id.toString(), hashed);

    return {
      message: 'Password has been reset successfully. You can now log in.',
    };
  }

  async refreshTokens(incomingRefreshToken: string) {
    // verify JWT signature and expiry — throws if invalid/expired
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(incomingRefreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    // load user and compare stored token (prevents reuse after rotation/logout)
    const user = await this.usersService.findById(payload.sub);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new UnauthorizedException('Refresh token has been revoked.');
    }

    // issue a new pair — the old refresh token is atomically overwritten
    return this.generateTokens(user._id.toString());
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully.' };
  }
}
