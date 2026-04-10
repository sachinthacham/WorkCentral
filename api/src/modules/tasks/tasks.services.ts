import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskComment } from './schemas/task-comment.schema';
import { TaskActivity } from './schemas/task-activity.schema';
import { TaskGateway } from './task.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<Task>,

    @InjectModel(TaskComment.name)
    private commentModel: Model<TaskComment>,

    @InjectModel(TaskActivity.name)
    private activityModel: Model<TaskActivity>,

    private taskGateway: TaskGateway,

    private notificationsService: NotificationsService,
  ) {}

  async createTask(
    title: string,
    description: string,
    projectId: string,
    workspaceId: string,
    userId: string,
    dto: CreateTaskDto,
  ) {
    return this.taskModel.create({
      title,
      description,
      projectId,
      workspaceId,
      createdBy: userId,
      priority: dto.priority || 'medium',
      labels: dto.labels || [],
    });
  }

  async getTasks(projectId: string) {
    return this.taskModel.find({ projectId });
  }

  async updateStatus(taskId: string, status: string) {
    const task = await this.taskModel.findByIdAndUpdate(
      taskId,
      { status },
      { new: true },
    );

    this.taskGateway.notifyTaskUpdate(task);

    return task;
  }

  async deleteTask(taskId: string) {
    return this.taskModel.findByIdAndDelete(taskId);
  }

  async assignTask(taskId: string, assigneeId: string) {
    const task = await this.taskModel.findByIdAndUpdate(
      taskId,
      { assignee: assigneeId },
      { new: true },
    );
    if (task) {
      await this.notificationsService.createNotification(
        assigneeId,
        `You were assigned the task "${task.title}"`,
        'task_assigned',
      );
    }

    return task;
  }

  // create comment
  async createComment(taskId: string, userId: string, content: string) {
    const comment = await this.commentModel.create({
      taskId,
      userId,
      content,
    });

    const task = await this.taskModel.findById(taskId);

    // notify task owner
    if (task && task.createdBy.toString() !== userId) {
      await this.notificationsService.createNotification(
        task.createdBy.toString(),
        `Someone commented on your task "${task.title}"`,
        'comment_added',
      );
    }

    return comment;
  }

  async getComments(taskId: string) {
    return this.commentModel.find({ taskId }).populate('userId', 'email');
  }

  async logActivity(
    taskId: string,
    userId: string,
    action: string,
    message: string,
  ) {
    return this.activityModel.create({
      taskId,
      userId,
      action,
      message,
    });
  }

  async getTaskActivities(taskId: string) {
    return this.activityModel
      .find({ taskId })
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
  }
}
