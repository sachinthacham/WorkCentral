import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

const toOid = (id: string) => new Types.ObjectId(id)
import { Project } from './schemas/project.schema'
import { ProjectMember } from './schemas/project-member.schema'
import { paginatedResult } from '../../common/helpers/paginated-result.helper'

@Injectable()
export class ProjectsService {

  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<Project>,

    @InjectModel(ProjectMember.name)
    private projectMemberModel: Model<ProjectMember>,
  ) {}

  async createProject(
    name: string,
    description: string,
    workspaceId: string,
    userId: string,
  ) {
    const project = await this.projectModel.create({
      name,
      description,
      workspaceId,
      createdBy: toOid(userId),
    })

    // Auto-seed the creator as MANAGER
    await this.projectMemberModel.create({
      projectId: project._id,
      userId: toOid(userId),
      role: 'MANAGER',
    })

    return project
  }

  async getProjects(workspaceId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    const wsOid = toOid(workspaceId)
    const [data, total] = await Promise.all([
      this.projectModel.find({ workspaceId: wsOid }).skip(skip).limit(limit),
      this.projectModel.countDocuments({ workspaceId: wsOid }),
    ])
    return paginatedResult(data, total, page, limit)
  }

  // ─── Member management ────────────────────────────────────────────────────

  async addMember(projectId: string, userId: string, role: string) {
    const project = await this.projectModel.findById(projectId)
    if (!project) throw new NotFoundException('Project not found.')

    try {
      const member = await this.projectMemberModel.create({ projectId, userId: toOid(userId), role })
      return member
    } catch (err) {
      if (err.code === 11000) {
        throw new ConflictException('User is already a member of this project.')
      }
      throw err
    }
  }

  async getMembers(projectId: string, page: number = 1, limit: number = 20) {
    const project = await this.projectModel.findById(projectId)
    if (!project) throw new NotFoundException('Project not found.')

    const query = { projectId }
    const skip = (page - 1) * limit
    const [members, total] = await Promise.all([
      this.projectMemberModel
        .find(query)
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit),
      this.projectMemberModel.countDocuments(query),
    ])

    const data = members.map((m: any) => ({
      userId: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
    }))

    return paginatedResult(data, total, page, limit)
  }

  async updateMemberRole(projectId: string, targetUserId: string, role: string) {
    const member = await this.projectMemberModel.findOneAndUpdate(
      { projectId, userId: toOid(targetUserId) },
      { role },
      { new: true },
    )

    if (!member) {
      throw new NotFoundException('Project member not found.')
    }

    return member
  }

  async removeMember(projectId: string, targetUserId: string, requestingUserId: string) {
    if (targetUserId === requestingUserId) {
      throw new ForbiddenException('You cannot remove yourself from the project.')
    }

    const member = await this.projectMemberModel.findOneAndDelete({
      projectId,
      userId: toOid(targetUserId),
    })

    if (!member) throw new NotFoundException('Project member not found.')

    return { message: 'Member removed from project.' }
  }

  async getUserRole(projectId: string, userId: string): Promise<string | null> {
    const member = await this.projectMemberModel.findOne({ projectId, userId: toOid(userId) })
    return member?.role ?? null
  }
}
