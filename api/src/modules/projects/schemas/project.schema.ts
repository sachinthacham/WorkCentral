import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ProjectDocument = Project & Document

@Schema({ timestamps: true })
export class Project {

  @Prop({ required: true })
  name: string

  @Prop()
  description: string

  @Prop({ type: Types.ObjectId, ref: 'Workspace' })
  workspaceId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId
}

export const ProjectSchema = SchemaFactory.createForClass(Project)

// Full-text search index
ProjectSchema.index({ name: 'text', description: 'text' }, { name: 'project_text_idx', weights: { name: 3, description: 1 } })