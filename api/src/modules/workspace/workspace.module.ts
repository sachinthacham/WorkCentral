import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from './schemas/workspace-member.schema';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from '../../common/guards/roles.guard'

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: WorkspaceMember.name, schema: WorkspaceMemberSchema },
    ]),
  ],

  controllers: [WorkspaceController],

  providers: [WorkspaceService,RolesGuard],
})
export class WorkspaceModule {}
