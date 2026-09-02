import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types, SchemaTypes } from "mongoose"

export type TaskCommentDocument = TaskComment & Document

@Schema({ timestamps: true })
export class TaskComment {

  @Prop({ type: SchemaTypes.ObjectId, ref: "Task" })
  taskId: Types.ObjectId

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  userId: Types.ObjectId

  @Prop({ required: true })
  content: string

}

export const TaskCommentSchema =
  SchemaFactory.createForClass(TaskComment)

// Full-text search index
TaskCommentSchema.index({ content: 'text' }, { name: 'comment_text_idx' })