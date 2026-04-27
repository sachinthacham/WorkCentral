import { Controller, Get, Post, Body, Param, Patch, UseGuards, Query } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('sprints')
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSprintDto: CreateSprintDto) {
    return this.sprintsService.create(createSprintDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('project/:projectId')
  findAllByProject(@Param('projectId') projectId: string, @Query() pagination: PaginationDto) {
    return this.sprintsService.findAllForProject(projectId, pagination.page, pagination.limit);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.sprintsService.updateStatus(id, status);
  }
}
