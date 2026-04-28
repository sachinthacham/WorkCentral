import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

/** Query for GET /tasks/me — must include every query key or ValidationPipe (forbidNonWhitelisted) rejects the request. */
export class MyAssignedTasksQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(['todo', 'in_progress', 'done'])
  status?: string;
}
