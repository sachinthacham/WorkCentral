import { IsString } from 'class-validator'

export class AddDependencyDto {
  // The task that must be completed BEFORE the target task can start
  @IsString()
  blockingTaskId: string
}
