import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types } from "mongoose"

const toOid = (id: string) => new Types.ObjectId(id)
import { Task } from "../tasks/schemas/task.schema"
import { Project } from "../projects/schemas/project.schema"

@Injectable()
export class DashboardService {

  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<Task>,

    @InjectModel(Project.name)
    private projectModel: Model<Project>
  ){}

  async getAnalytics(workspaceId: string){
    const wsOid = toOid(workspaceId)
    const tasks = await this.taskModel.find({ workspaceId: wsOid })

    const projects = await this.projectModel.countDocuments({
      workspaceId: wsOid
    })

    const statusCounts = {
      todo: 0,
      in_progress: 0,
      done: 0
    }

    tasks.forEach((task:any)=>{

      statusCounts[task.status]++

    })

    return {

      totalProjects: projects,

      totalTasks: tasks.length,

      tasksByStatus: statusCounts

    }

  }

}