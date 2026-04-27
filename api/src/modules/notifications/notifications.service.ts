import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { paginatedResult } from '../../common/helpers/paginated-result.helper';

const toOid = (id: string) => new Types.ObjectId(id)

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(userId: string, message: string, type: string) {
    return this.notificationModel.create({
      userId: toOid(userId),
      message,
      type,
    });
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query = { userId: toOid(userId) };
    const [data, total] = await Promise.all([
      this.notificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.notificationModel.countDocuments(query),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
  }
}
