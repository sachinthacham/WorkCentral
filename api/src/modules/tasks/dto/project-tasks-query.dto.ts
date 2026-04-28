import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/** Query for GET /tasks/:projectId — whitelists all supported filters for ValidationPipe. */
export class ProjectTasksQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  dueDateStart?: string;

  @IsOptional()
  @IsString()
  dueDateEnd?: string;
}
