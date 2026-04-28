import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ProjectMemberDocument = ProjectMember & Document

export enum ProjectRole {
  MANAGER = 'MANAGER', // Full control: manage members, settings, sprints
  MEMBER  = 'MEMBER',  // Create and edit tasks, comment
  VIEWER  = 'VIEWER',  // Read-only access
}

@Schema({ timestamps: true })
export class ProjectMember {

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({
    type: String,
    enum: Object.values(ProjectRole),
    default: ProjectRole.MEMBER,
  })
  role: string
}

export const ProjectMemberSchema = SchemaFactory.createForClass(ProjectMember)

// Enforce one membership record per (project, user) pair
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true })
