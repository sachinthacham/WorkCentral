import { Controller, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Get, Patch } from '@nestjs/common';
import { InviteUserDto } from './dto/invite-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('workspace')
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @UseGuards(JwtAuthGuard)
  // create workspace
  @Post()
  createWorkspace(@Body() dto: CreateWorkspaceDto, @Request() req) {
    return this.workspaceService.createWorkspace(dto.name, req.user.userId);
  }

  // get user workspaces
  @UseGuards(JwtAuthGuard)
  @Get()
  getUserWorkspaces(@Request() req, @Query() pagination: PaginationDto) {
    return this.workspaceService.getUserWorkspaces(req.user.userId, pagination.page, pagination.limit);
  }

  // invite user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post('invite')
  inviteUser(@Body() dto: InviteUserDto, @Request() req) {
    const workspaceId = req.headers['workspaceid'];

    return this.workspaceService.inviteUser(workspaceId, dto.email, dto.role);
  }

  // get workspace members
  @UseGuards(JwtAuthGuard)
  @Get('members')
  getMembers(@Request() req, @Query() pagination: PaginationDto) {
    const workspaceId = req.headers['workspaceid'];
    return this.workspaceService.getMembers(workspaceId, pagination.page, pagination.limit);
  }

  // update settings
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Patch('settings')
  updateSettings(@Body() settings: any, @Request() req) {
    const workspaceId = req.headers['workspaceid'];
    return this.workspaceService.updateSettings(workspaceId, settings);
  }
}
