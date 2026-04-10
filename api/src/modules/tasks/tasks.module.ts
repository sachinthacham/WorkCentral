import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksService } from './tasks.services';
import { TasksController } from './tasks.controller';
import { TaskComment, TaskCommentSchema } from './schemas/task-comment.schema';
import {
  TaskActivity,
  TaskActivitySchema,
} from './schemas/task-activity.schema';
import { TaskGateway } from './task.gateway';
import { NotificationSchema } from '../notifications/schemas/notification.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsController } from '../notifications/notifications.controller';
import { Notification } from '../notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: TaskComment.name, schema: TaskCommentSchema },
      { name: TaskActivity.name, schema: TaskActivitySchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],

  providers: [TasksService, TaskGateway, NotificationsService],
  controllers: [TasksController, NotificationsController],
})
export class TasksModule {}
