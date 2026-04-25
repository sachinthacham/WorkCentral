import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Project, ProjectSchema } from './schemas/project.schema'
import { ProjectMember, ProjectMemberSchema } from './schemas/project-member.schema'
import { WorkspaceMember, WorkspaceMemberSchema } from '../workspace/schemas/workspace-member.schema'
import { ProjectsService } from './projects.service'
import { ProjectsController } from './projects.controller'
import { ProjectRolesGuard } from '../../common/guards/project-roles.guard'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema },
      // Needed by ProjectRolesGuard for the workspace-level bypass check
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],

  controllers: [ProjectsController],

  providers: [ProjectsService, ProjectRolesGuard],

  exports: [ProjectsService, ProjectRolesGuard],
})
export class ProjectsModule {}
