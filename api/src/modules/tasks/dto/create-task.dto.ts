import { IsString, IsOptional, IsArray } from "class-validator"

export class CreateTaskDto {

  @IsString()
  title: string

  @IsString()
  description: string

  @IsString()
  projectId: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsArray()
  labels?: string[]
}