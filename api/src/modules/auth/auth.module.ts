import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UsersModule } from '../users/users.module'
import { EmailModule } from '../email/email.module'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { ConfigService } from '@nestjs/config'
import { ConfigModule } from '@nestjs/config'

import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [

    UsersModule,
    EmailModule,
    ConfigModule,
    PassportModule,

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }
      })
    })

  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy
  ],

  exports: [AuthService]

})
export class AuthModule {}