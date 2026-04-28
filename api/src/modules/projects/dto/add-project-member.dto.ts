import { IsString, IsIn } from 'class-validator'

export class AddProjectMemberDto {
  @IsString()
  userId: string

  @IsString()
  @IsIn(['MANAGER', 'MEMBER', 'VIEWER'])
  role: string
}
