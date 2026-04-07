import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Workspace } from './schemas/workspace.schema'
import { WorkspaceMember } from './schemas/workspace-member.schema'
import { User } from '../users/schemas/user.schema'

@Injectable()
export class WorkspaceService {

  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<Workspace>,

    @InjectModel(WorkspaceMember.name)
    private memberModel: Model<WorkspaceMember>,

    @InjectModel(User.name)
    private userModel: Model<User>
  ) {}
 // create workspace
  async createWorkspace(name: string, userId: string) {

    const workspace = await this.workspaceModel.create({
      name,
      owner: userId
    })

    await this.memberModel.create({
      workspaceId: workspace._id,
      userId: userId,
      role: 'admin'
    })

    return workspace
  }

  // get user workspaces
  async getUserWorkspaces(userId: string) {

  const memberships = await this.memberModel
    .find({ userId })
    .populate('workspaceId')

  return memberships.map((member) => {
  const workspace: any = member.workspaceId

  return {
    workspaceId: workspace._id,
    name: workspace.name,
    role: member.role
  }
})
}

//invite user
async inviteUser(
  workspaceId: string,
  email: string,
  role: string
){

  const user = await this.userModel.findOne({ email })

  if(!user){
    throw new Error("User not found")
  }

  const existing = await this.memberModel.findOne({
    workspaceId,
    userId: user._id
  })

  if(existing){
    throw new Error("User already in workspace")
  }

  return this.memberModel.create({
    workspaceId,
    userId: user._id,
    role
  })
}

}