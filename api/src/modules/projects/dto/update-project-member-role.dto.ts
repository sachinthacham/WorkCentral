import { IsString, IsIn } from 'class-validator'

export class UpdateProjectMemberRoleDto {
  @IsString()
  @IsIn(['MANAGER', 'MEMBER', 'VIEWER'])
  role: string
}
