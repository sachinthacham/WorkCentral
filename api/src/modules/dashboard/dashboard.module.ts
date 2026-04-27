import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"

import { Task, TaskSchema } from "../tasks/schemas/task.schema"
import { Project, ProjectSchema } from "../projects/schemas/project.schema"

import { DashboardController } from "./dashboard.controller"
import { DashboardService } from "./dashboard.service"

@Module({

  imports:[
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Project.name, schema: ProjectSchema }
    ])
  ],

  controllers:[DashboardController],
  providers:[DashboardService]

})
export class DashboardModule {}