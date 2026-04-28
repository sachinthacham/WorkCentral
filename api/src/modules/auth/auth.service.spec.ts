jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}))

import { Test, TestingModule } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import {
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { EmailService } from '../email/email.service'

describe('AuthService', () => {
  let service: AuthService
  let usersService: jest.Mocked<Pick<
    UsersService,
    | 'findByEmail'
    | 'findById'
    | 'updateRefreshToken'
    | 'setPasswordResetToken'
    | 'findByPasswordResetToken'
    | 'updatePassword'
  >>
  let jwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>
  let emailService: { sendPasswordResetEmail: jest.Mock }

  const userId = '507f1f77bcf86cd799439011'
  const mockUser = {
    _id: { toString: () => userId },
    email: 'u@test.com',
    password: 'hashed',
    refreshToken: 'stored-refresh',
  }

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn().mockResolvedValue(undefined),
      setPasswordResetToken: jest.fn().mockResolvedValue(undefined),
      findByPasswordResetToken: jest.fn(),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    }

    jwtService = {
      sign: jest.fn().mockImplementation(() => 'jwt-token'),
      verify: jest.fn(),
    }

    emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: EmailService, useValue: emailService },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
      ],
    }).compile()

    service = module.get(AuthService)
    jest.mocked(bcrypt.compare).mockReset()
  })

  describe('login', () => {
    it('throws when email is unknown', async () => {
      usersService.findByEmail.mockResolvedValue(null as any)
      await expect(
        service.login({ email: 'x@test.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('throws when password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any)
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never)
      await expect(
        service.login({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('returns tokens and persists refresh token on success', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as any)
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never)

      const out = await service.login({
        email: mockUser.email,
        password: 'ok',
      })

      expect(out).toEqual({ accessToken: 'jwt-token', refreshToken: 'jwt-token' })
      expect(jwtService.sign).toHaveBeenCalledTimes(2)
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        userId,
        'jwt-token',
      )
    })
  })

  describe('refreshTokens', () => {
    it('throws when JWT verify fails', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid')
      })
      await expect(service.refreshTokens('bad')).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
    })

    it('throws when stored refresh does not match', async () => {
      jwtService.verify.mockReturnValue({ sub: userId })
      usersService.findById.mockResolvedValue({
        ...mockUser,
        refreshToken: 'other',
      } as any)

      await expect(service.refreshTokens('incoming')).rejects.toBeInstanceOf(
        UnauthorizedException,
      )
    })

    it('issues new pair when refresh is valid', async () => {
      jwtService.verify.mockReturnValue({ sub: userId })
      usersService.findById.mockResolvedValue(mockUser as any)

      const out = await service.refreshTokens('stored-refresh')

      expect(out.accessToken).toBe('jwt-token')
      expect(usersService.updateRefreshToken).toHaveBeenCalled()
    })
  })

  describe('forgotPassword', () => {
    it('returns generic message when user missing and does not send mail', async () => {
      usersService.findByEmail.mockResolvedValue(null as any)
      const res = await service.forgotPassword('ghost@test.com')
      expect(res.message).toContain('If an account')
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('throws when token is not found', async () => {
      usersService.findByPasswordResetToken.mockResolvedValue(null as any)
      await expect(
        service.resetPassword('tok', 'newPass123'),
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })
})
