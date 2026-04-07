import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
}
