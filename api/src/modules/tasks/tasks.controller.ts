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
} from '@nestjs/common';

import { TasksService } from './tasks.services';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
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
      dto.description,
      dto.projectId,
      workspaceId,
      req.user.userId,
      dto
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':projectId')
  getTasks(@Param('projectId') projectId: string) {
    return this.tasksService.getTasks(projectId);
  }

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
getComments(@Param("taskId") taskId: string) {

  return this.tasksService.getComments(taskId)

}

@UseGuards(JwtAuthGuard)
@Get(":taskId/activity")
getActivity(@Param("taskId") taskId:string){

  return this.tasksService.getTaskActivities(taskId)

}
}
