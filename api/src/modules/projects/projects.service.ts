import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Project } from './schemas/project.schema'

@Injectable()
export class ProjectsService {

  constructor(
    @InjectModel(Project.name)
    private projectModel: Model<Project>
  ) {}

  async createProject(
    name: string,
    description: string,
    workspaceId: string,
    userId: string
  ) {

    return this.projectModel.create({
      name,
      description,
      workspaceId,
      createdBy: userId
    })
  }

  async getProjects(workspaceId: string){

    return this.projectModel.find({ workspaceId })
  }

}