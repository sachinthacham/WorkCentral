import { IsString, IsOptional, IsArray, IsNumber, IsDateString } from "class-validator"

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsArray()
  labels?: string[]

  @IsOptional()
  @IsString()
  coverColor?: string

  @IsOptional()
  @IsNumber()
  order?: number

  @IsOptional()
  @IsArray()
  checklist?: Array<{ id: string, text: string, isCompleted: boolean }>

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsString()
  sprintId?: string
}
