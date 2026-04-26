import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type WorkspaceMemberDocument = WorkspaceMember & Document

@Schema({ timestamps: true })
export class WorkspaceMember {

  @Prop({ type: Types.ObjectId, ref: 'Workspace', required: true })
  workspaceId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({
    type: String,
    enum: ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'],
    default: 'MEMBER'
  })
  role: string
}

export const WorkspaceMemberSchema =
  SchemaFactory.createForClass(WorkspaceMember)