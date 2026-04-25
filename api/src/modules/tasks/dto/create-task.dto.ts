import { IsString, IsOptional, IsArray } from "class-validator"

export class CreateTaskDto {

  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  projectId: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsArray()
  labels?: string[]

  @IsOptional()
  @IsString()
  parentTaskId?: string
}