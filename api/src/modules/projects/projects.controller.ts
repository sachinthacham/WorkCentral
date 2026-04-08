import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request
} from '@nestjs/common'

import { ProjectsService } from './projects.service'
import { CreateProjectDto } from './dto/create-project.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@Controller('projects')
export class ProjectsController {

  constructor(private projectsService: ProjectsService){}

  @UseGuards(JwtAuthGuard)
  @Post()
  createProject(@Body() dto: CreateProjectDto, @Request() req){

    const workspaceId = req.headers["workspaceid"]

    return this.projectsService.createProject(
      dto.name,
      dto.description,
      workspaceId,
      req.user.userId
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProjects(@Request() req){

    const workspaceId = req.headers["workspaceid"]

    return this.projectsService.getProjects(workspaceId)
  }

}