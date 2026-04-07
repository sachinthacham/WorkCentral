import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common'

import { Reflector } from '@nestjs/core'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { WorkspaceMember } from '../../modules/workspace/schemas/workspace-member.schema'

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(
    private reflector: Reflector,

    @InjectModel(WorkspaceMember.name)
    private memberModel: Model<WorkspaceMember>
  ){}

  async canActivate(context: ExecutionContext){

    const requiredRoles =
      this.reflector.get<string[]>('roles',
        context.getHandler())

    if(!requiredRoles){
      return true
    }

    const request = context.switchToHttp().getRequest()

    const userId = request.user.userId
    const workspaceId = request.headers['workspaceid']

    const member = await this.memberModel.findOne({
      workspaceId,
      userId
    })

    if(!member){
      return false
    }

    return requiredRoles.includes(member.role)
  }

}