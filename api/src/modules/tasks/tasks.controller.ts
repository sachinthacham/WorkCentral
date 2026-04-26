import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { MyAssignedTasksQueryDto } from './dto/my-assigned-tasks-query.dto';
import { ProjectTasksQueryDto } from './dto/project-tasks-query.dto';
import { AddDependencyDto } from './dto/add-dependency.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text / code
  'text/plain', 'text/csv',
  // Archives
  'application/zip', 'application/x-zip-compressed',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

import { TasksService } from './tasks.services';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createTask(@Body() dto: CreateTaskDto, @Request() req) {
    const workspaceId = req.headers['workspaceid'];

    return this.tasksService.createTask(
      dto.title,
      dto.description ?? '',
      dto.projectId,
      workspaceId,
      req.user.userId,
      dto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/counts')
  getMyTaskCounts(@Request() req) {
    const workspaceId = req.headers['workspaceid'];
    return this.tasksService.getMyAssignedTaskCounts(workspaceId, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyTasks(@Request() req, @Query() query: MyAssignedTasksQueryDto) {
    const workspaceId = req.headers['workspaceid'];
    return this.tasksService.getMyAssignedTasks(
      workspaceId,
      req.user.userId,
      { status: query.status },
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':projectId')
  getTasks(@Param('projectId') projectId: string, @Query() query: ProjectTasksQueryDto) {
    // Only return top-level tasks by default (parentTaskId === null)
    return this.tasksService.getTasks(
      projectId,
      {
        status: query.status,
        assignee: query.assignee,
        search: query.search,
        dueDateStart: query.dueDateStart,
        dueDateEnd: query.dueDateEnd,
        parentTaskId: null,
      },
      query.page,
      query.limit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':taskId')
  updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(taskId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':taskId/attachments')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'attachments'),
      filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(`File type '${file.mimetype}' is not allowed.`), false);
      }
    },
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
  }))
  uploadAttachment(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }
    const fileUrl = `/uploads/attachments/${file.filename}`;
    return this.tasksService.addAttachment(taskId, fileUrl);
  }

  // ─── Sub-tasks ──────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post(':taskId/subtasks')
  createSubTask(
    @Param('taskId') taskId: string,
    @Body() dto: any,
    @Request() req,
  ) {
    const workspaceId = req.headers['workspaceid'];
    dto.parentTaskId = taskId;
    return this.tasksService.createTask(dto.title, dto.description, dto.projectId, workspaceId, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':taskId/subtasks')
  getSubTasks(@Param('taskId') taskId: string, @Query() pagination: PaginationDto) {
    return this.tasksService.getSubTasks(taskId, pagination.page, pagination.limit);
  }

  // ─── Dependencies ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post(':taskId/dependencies')
  addDependency(@Param('taskId') taskId: string, @Body() dto: AddDependencyDto) {
    return this.tasksService.addDependency(taskId, dto.blockingTaskId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':taskId/dependencies/:blockingTaskId')
  removeDependency(
    @Param('taskId') taskId: string,
    @Param('blockingTaskId') blockingTaskId: string,
  ) {
    return this.tasksService.removeDependency(taskId, blockingTaskId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':taskId/dependencies')
  getDependencies(@Param('taskId') taskId: string) {
    return this.tasksService.getDependencies(taskId);
  }

  // ────────────────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Patch(':taskId/status')
  updateStatus(
    @Param('taskId') taskId: string,
    @Body('status') status: string,
  ) {
    return this.tasksService.updateStatus(taskId, status);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':taskId')
  deleteTask(@Param('taskId') taskId: string) {
    return this.tasksService.deleteTask(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':taskId/assign')
  assignTask(@Param('taskId') taskId: string, @Body() dto: AssignTaskDto) {
    return this.tasksService.assignTask(taskId, dto.userId);
  }

  @UseGuards(JwtAuthGuard)
@Post(":taskId/comments")
createComment(
  @Param("taskId") taskId: string,
  @Body() dto: CreateCommentDto,
  @Request() req
) {

  return this.tasksService.createComment(
    taskId,
    req.user.userId,
    dto.content
  )

}

@UseGuards(JwtAuthGuard)
@Get(":taskId/comments")
getComments(@Param("taskId") taskId: string, @Query() pagination: PaginationDto) {
  return this.tasksService.getComments(taskId, pagination.page, pagination.limit)
}

@UseGuards(JwtAuthGuard)
@Get(":taskId/activity")
getActivity(@Param("taskId") taskId: string, @Query() pagination: PaginationDto) {
  return this.tasksService.getTaskActivities(taskId, pagination.page, pagination.limit)
}
}
