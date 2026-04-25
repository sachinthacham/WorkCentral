import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';

import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { UpdateProjectMemberRoleDto } from './dto/update-project-member-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectRolesGuard } from '../../common/guards/project-roles.guard';
import { ProjectRoles } from '../../common/decorators/project-roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createProject(@Body() dto: CreateProjectDto, @Request() req) {
    const workspaceId = req.headers['workspaceid'];
    return this.projectsService.createProject(
      dto.name,
      dto.description,
      workspaceId,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getProjects(@Request() req, @Query() pagination: PaginationDto) {
    const workspaceId = req.headers['workspaceid'];
    return this.projectsService.getProjects(
      workspaceId,
      pagination.page,
      pagination.limit,
    );
  }

  // ─── Project Member Management

  @UseGuards(JwtAuthGuard, ProjectRolesGuard)
  @ProjectRoles('MANAGER')
  @Post(':projectId/members')
  addMember(
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(projectId, dto.userId, dto.role);
  }

  // Listing members is visible to all project members (MANAGER, MEMBER, VIEWER)
  @UseGuards(JwtAuthGuard, ProjectRolesGuard)
  @ProjectRoles('MANAGER', 'MEMBER', 'VIEWER')
  @Get(':projectId/members')
  getMembers(
    @Param('projectId') projectId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.projectsService.getMembers(
      projectId,
      pagination.page,
      pagination.limit,
    );
  }

  @UseGuards(JwtAuthGuard, ProjectRolesGuard)
  @ProjectRoles('MANAGER')
  @Patch(':projectId/members/:userId/role')
  updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateProjectMemberRoleDto,
  ) {
    return this.projectsService.updateMemberRole(projectId, userId, dto.role);
  }

  @UseGuards(JwtAuthGuard, ProjectRolesGuard)
  @ProjectRoles('MANAGER')
  @Delete(':projectId/members/:userId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.projectsService.removeMember(
      projectId,
      userId,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':projectId/my-role')
  getMyRole(@Param('projectId') projectId: string, @Request() req) {
    return this.projectsService.getUserRole(projectId, req.user.userId);
  }
}
