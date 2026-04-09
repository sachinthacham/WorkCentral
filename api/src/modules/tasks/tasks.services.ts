import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task } from './schemas/task.schema'

@Injectable()
export class TasksService {

  constructor(
    @InjectModel(Task.name)
    private taskModel: Model<Task>
  ){}

  async createTask(
    title:string,
    description:string,
    projectId:string,
    workspaceId:string,
    userId:string
  ){

    return this.taskModel.create({
      title,
      description,
      projectId,
      workspaceId,
      createdBy:userId
    })
  }

  async getTasks(projectId:string){

    return this.taskModel.find({ projectId })
  }

  async updateStatus(taskId:string,status:string){

    return this.taskModel.findByIdAndUpdate(
      taskId,
      { status },
      { new:true }
    )
  }

  async deleteTask(taskId:string){

    return this.taskModel.findByIdAndDelete(taskId)
  }

}