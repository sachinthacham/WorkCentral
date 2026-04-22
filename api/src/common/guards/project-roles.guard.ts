import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PROJECT_ROLES_KEY } from '../decorators/project-roles.decorator'
import { ProjectMember } from '../../modules/projects/schemas/project-member.schema'
import { WorkspaceMember } from '../../modules/workspace/schemas/workspace-member.schema'

@Injectable()
export class ProjectRolesGuard implements CanActivate {

  constructor(
    private reflector: Reflector,

    @InjectModel(ProjectMember.name)
    private projectMemberModel: Model<ProjectMember>,

    @InjectModel(WorkspaceMember.name)
    private workspaceMemberModel: Model<WorkspaceMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      PROJECT_ROLES_KEY,
      context.getHandler(),
    )

    // No roles required — allow through
    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.userId
    if (!userId) return false

    // Resolve projectId: prefer route param, fall back to header
    const projectId = request.params.projectId ?? request.headers['projectid']
    if (!projectId) return false

    const workspaceId = request.headers['workspaceid']

    // ── Workspace-level bypass ──────────────────────────────────────────────
    // OWNER and ADMIN can always access any project in their workspace
    if (workspaceId) {
      const wsMember = await this.workspaceMemberModel.findOne({ workspaceId, userId })
      if (wsMember && ['OWNER', 'ADMIN'].includes(wsMember.role.toUpperCase())) {
        return true
      }
    }

    // ── Project-level role check ────────────────────────────────────────────
    const projectMember = await this.projectMemberModel.findOne({ projectId, userId })

    if (!projectMember) {
      throw new ForbiddenException('You are not a member of this project.')
    }

    if (!requiredRoles.includes(projectMember.role)) {
      throw new ForbiddenException(
        `This action requires one of the following project roles: ${requiredRoles.join(', ')}.`,
      )
    }

    return true
  }
}
