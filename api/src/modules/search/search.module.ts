import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { Task, TaskSchema } from '../tasks/schemas/task.schema'
import { Project, ProjectSchema } from '../projects/schemas/project.schema'
import { TaskComment, TaskCommentSchema } from '../tasks/schemas/task-comment.schema'
import { WorkspaceMember, WorkspaceMemberSchema } from '../workspace/schemas/workspace-member.schema'

import { SearchService } from './search.service'
import { SearchController } from './search.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name,            schema: TaskSchema },
      { name: Project.name,         schema: ProjectSchema },
      { name: TaskComment.name,     schema: TaskCommentSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],

  controllers: [SearchController],
  providers:   [SearchService],
})
export class SearchModule {}
