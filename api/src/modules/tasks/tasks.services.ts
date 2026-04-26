import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

const toOid = (id: string) => new Types.ObjectId(id);
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskComment } from './schemas/task-comment.schema';
import { TaskActivity } from './schemas/task-activity.schema';
import { TaskGateway } from './task.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { paginatedResult } from '../../common/helpers/paginated-result.helper';

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
    // If this is a sub-task, verify the parent exists and belongs to the same project
    if (dto.parentTaskId) {
      const parent = await this.taskModel.findById(dto.parentTaskId);
      if (!parent) throw new NotFoundException('Parent task not found.');
      if (parent.projectId.toString() !== projectId) {
        throw new BadRequestException(
          'Sub-task must belong to the same project as its parent.',
        );
      }
      // Prevent nesting sub-tasks
      if (parent.parentTaskId) {
        throw new BadRequestException(
          'Sub-tasks cannot be nested. Only one level of sub-tasks is allowed.',
        );
      }
    }

    return this.taskModel.create({
      title,
      description,
      projectId: toOid(projectId),
      workspaceId: toOid(workspaceId),
      createdBy: toOid(userId),
      priority: dto.priority || 'medium',
      labels: dto.labels || [],
      parentTaskId: dto.parentTaskId ? toOid(dto.parentTaskId) : null,
    });
  }

  async getTasks(
    projectId: string,
    filters: any = {},
    page: number = 1,
    limit: number = 20,
  ) {
    const query: any = { projectId: toOid(projectId) };

    if (filters.status) query.status = filters.status;
    if (filters.assignee) query.assignee = toOid(filters.assignee);
    if (filters.search) query.title = { $regex: filters.search, $options: 'i' };

    // Explicit parentTaskId filter: null means top-level only, a string means sub-tasks of that parent
    if ('parentTaskId' in filters) {
      query.parentTaskId = filters.parentTaskId;
    }

    if (filters.dueDateStart || filters.dueDateEnd) {
      query.dueDate = {};
      if (filters.dueDateStart)
        query.dueDate.$gte = new Date(filters.dueDateStart);
      if (filters.dueDateEnd) query.dueDate.$lte = new Date(filters.dueDateEnd);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.taskModel.find(query).skip(skip).limit(limit),
      this.taskModel.countDocuments(query),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  /** Top-level tasks assigned to the current user within a workspace (for “My tasks” page). */
  async getMyAssignedTasks(
    workspaceId: string,
    userId: string,
    filters: { status?: string },
    page: number = 1,
    limit: number = 20,
  ) {
    const query: Record<string, unknown> = {
      workspaceId: toOid(workspaceId),
      assignee: toOid(userId),
      parentTaskId: null,
    };
    if (filters.status) query.status = filters.status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.taskModel
        .find(query)
        .populate('projectId', 'name')
        .sort({ dueDate: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      this.taskModel.countDocuments(query),
    ]);

    return paginatedResult(data, total, page, limit);
  }

  async getMyAssignedTaskCounts(workspaceId: string, userId: string) {
    const base = {
      workspaceId: toOid(workspaceId),
      assignee: toOid(userId),
      parentTaskId: null,
    };
    const [total, todo, in_progress, done] = await Promise.all([
      this.taskModel.countDocuments(base),
      this.taskModel.countDocuments({ ...base, status: 'todo' }),
      this.taskModel.countDocuments({ ...base, status: 'in_progress' }),
      this.taskModel.countDocuments({ ...base, status: 'done' }),
    ]);
    return { total, todo, in_progress, done };
  }

  async updateTask(taskId: string, dto: UpdateTaskDto) {
    const task = await this.taskModel.findByIdAndUpdate(taskId, dto, {
      new: true,
    });
    if (task) {
      this.taskGateway.notifyTaskUpdate(task);
    }
    return task;
  }

  async addAttachment(taskId: string, fileUrl: string) {
    const task = await this.taskModel.findByIdAndUpdate(
      taskId,
      { $push: { attachments: fileUrl } },
      { new: true },
    );
    if (task) {
      this.taskGateway.notifyTaskUpdate(task);
    }
    return task;
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
      taskId: toOid(taskId),
      userId: toOid(userId),
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

  async getComments(taskId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const tid = toOid(taskId);
    const [data, total] = await Promise.all([
      this.commentModel
        .find({ taskId: tid })
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit),
      this.commentModel.countDocuments({ taskId: tid }),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  async logActivity(
    taskId: string,
    userId: string,
    action: string,
    message: string,
  ) {
    return this.activityModel.create({
      taskId: toOid(taskId),
      userId: toOid(userId),
      action,
      message,
    });
  }

  async getTaskActivities(
    taskId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const tid = toOid(taskId);
    const [data, total] = await Promise.all([
      this.activityModel
        .find({ taskId: tid })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.activityModel.countDocuments({ taskId: tid }),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  // ─── Sub-tasks ────────────────────────────────────────────────────────────

  async getSubTasks(
    parentTaskId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const parent = await this.taskModel.findById(parentTaskId);
    if (!parent) throw new NotFoundException('Task not found.');

    const query = { parentTaskId: new Types.ObjectId(parentTaskId) };
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.taskModel.find(query).skip(skip).limit(limit),
      this.taskModel.countDocuments(query),
    ]);
    return paginatedResult(data, total, page, limit);
  }

  // ─── Dependencies ─────────────────────────────────────────────────────────

  async addDependency(taskId: string, blockingTaskId: string) {
    if (taskId === blockingTaskId) {
      throw new BadRequestException('A task cannot depend on itself.');
    }

    const [task, blockingTask] = await Promise.all([
      this.taskModel.findById(taskId),
      this.taskModel.findById(blockingTaskId),
    ]);

    if (!task) throw new NotFoundException('Task not found.');
    if (!blockingTask) throw new NotFoundException('Blocking task not found.');

    const taskObjId = new Types.ObjectId(taskId);
    const blockingObjId = new Types.ObjectId(blockingTaskId);

    // Check if already linked
    if (task.blockedBy.some((id) => id.equals(blockingObjId))) {
      throw new BadRequestException('This dependency already exists.');
    }

    // Cycle detection: check if blockingTask is already blocked by taskId
    // (i.e. adding A blocks B when B already blocks A would create a cycle)
    const wouldCreateCycle = await this.hasCyclicPath(blockingTaskId, taskId);
    if (wouldCreateCycle) {
      throw new BadRequestException(
        'Adding this dependency would create a circular dependency chain.',
      );
    }

    // Update both sides atomically
    await Promise.all([
      this.taskModel.findByIdAndUpdate(taskId, {
        $addToSet: { blockedBy: blockingObjId },
      }),
      this.taskModel.findByIdAndUpdate(blockingTaskId, {
        $addToSet: { blocks: taskObjId },
      }),
    ]);

    return this.getDependencies(taskId);
  }

  async removeDependency(taskId: string, blockingTaskId: string) {
    const blockingObjId = new Types.ObjectId(blockingTaskId);
    const taskObjId = new Types.ObjectId(taskId);

    await Promise.all([
      this.taskModel.findByIdAndUpdate(taskId, {
        $pull: { blockedBy: blockingObjId },
      }),
      this.taskModel.findByIdAndUpdate(blockingTaskId, {
        $pull: { blocks: taskObjId },
      }),
    ]);

    return this.getDependencies(taskId);
  }

  async getDependencies(taskId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate('blockedBy', 'title status priority assignee')
      .populate('blocks', 'title status priority assignee');

    if (!task) throw new NotFoundException('Task not found.');

    return {
      taskId,
      blockedBy: task.blockedBy,
      blocks: task.blocks,
    };
  }

  // BFS to check if `fromId` can reach `toId` via the `blockedBy` chain
  private async hasCyclicPath(fromId: string, toId: string): Promise<boolean> {
    const visited = new Set<string>();
    const queue = [fromId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const node = await this.taskModel.findById(current).select('blockedBy');
      if (node?.blockedBy?.length) {
        for (const dep of node.blockedBy) {
          queue.push(dep.toString());
        }
      }
    }

    return false;
  }
}
