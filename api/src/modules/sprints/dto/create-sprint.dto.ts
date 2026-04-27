import { IsString, IsOptional, IsDateString } from "class-validator"

export class CreateSprintDto {
  @IsString()
  name: string

  @IsString()
  projectId: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string
}
