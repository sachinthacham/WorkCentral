import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) {}

  async create(data: Partial<User>) {
    return this.userModel.create(data)
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email })
  }

  async findById(userId: string) {
    return this.userModel.findById(userId).exec()
  }

  async updateRefreshToken(userId: string, token: string | null) {
    return this.userModel.findByIdAndUpdate(userId, {
      refreshToken: token
    }).exec()
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date) {
    return this.userModel.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpiry: expiry,
    }).exec()
  }

  async findByPasswordResetToken(token: string) {
    return this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    }).exec()
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    }).exec()
  }

}