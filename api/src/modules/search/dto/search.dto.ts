import { IsString, IsOptional, IsIn, IsInt, Min, Max, MinLength } from 'class-validator'
import { Type } from 'class-transformer'

export class SearchDto {
  @IsString()
  @MinLength(1)
  q: string

  // Narrow results to a single entity type; omit to search all
  @IsOptional()
  @IsString()
  @IsIn(['tasks', 'projects', 'comments', 'members'])
  type?: string

  // Max results per category (capped at 50)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10
}
