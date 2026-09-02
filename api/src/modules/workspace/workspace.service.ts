import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

const toOid = (id: string) => new Types.ObjectId(id)
import { Workspace } from './schemas/workspace.schema'
import { WorkspaceMember } from './schemas/workspace-member.schema'
import { User } from '../users/schemas/user.schema'
import { EmailService } from '../email/email.service'
import { paginatedResult } from '../../common/helpers/paginated-result.helper'

@Injectable()
export class WorkspaceService {

  constructor(
    @InjectModel(Workspace.name)
    private workspaceModel: Model<Workspace>,

    @InjectModel(WorkspaceMember.name)
    private memberModel: Model<WorkspaceMember>,

    @InjectModel(User.name)
    private userModel: Model<User>,

    private emailService: EmailService
  ) {}
 // create workspace
  async createWorkspace(name: string, userId: string) {

    const workspace = await this.workspaceModel.create({
      name,
      owner: userId
    })

    await this.memberModel.create({
      workspaceId: workspace._id,
      userId: toOid(userId),
      role: 'OWNER'
    })

    return workspace
  }

  // get user workspaces
  async getUserWorkspaces(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query = { userId: toOid(userId) };
    const [memberships, total] = await Promise.all([
      this.memberModel.find(query).populate('workspaceId').skip(skip).limit(limit),
      this.memberModel.countDocuments(query),
    ]);

    const data = memberships.map((member) => {
      const workspace: any = member.workspaceId;
      return { workspaceId: workspace._id, name: workspace.name, role: member.role };
    });

    return paginatedResult(data, total, page, limit);
  }

//invite user
async inviteUser(
  workspaceId: string,
  email: string,
  role: string
){

  const user = await this.userModel.findOne({ email })

  if(!user){
    throw new NotFoundException("No account found with that email")
  }

  const existing = await this.memberModel.findOne({
    workspaceId,
    userId: user._id
  })

  if(existing){
    throw new ConflictException("User already in workspace")
  }

  const member = await this.memberModel.create({
    workspaceId,
    userId: user._id,
    role: role.toUpperCase()   // normalise to match enum: OWNER | ADMIN | MEMBER | GUEST
  })

  const workspace = await this.workspaceModel.findById(workspaceId)
  
  if (workspace) {
    await this.emailService.sendInvitationEmail(email, workspace.name, role)
  }

  return member
}

  //get workspace members
  async getMembers(workspaceId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query = { workspaceId };
    const [members, total] = await Promise.all([
      this.memberModel.find(query).populate('userId', 'name email').skip(skip).limit(limit),
      this.memberModel.countDocuments(query),
    ]);

    const data = members.map((m: any) => ({
      userId: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
    }));

    return paginatedResult(data, total, page, limit);
  }

// update workspace settings
async updateSettings(workspaceId: string, settings: any) {
  const workspace = await this.workspaceModel.findByIdAndUpdate(
    workspaceId,
    { $set: { settings } },
    { new: true }
  );
  return workspace;
}

}