import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types, SchemaTypes } from "mongoose"

export type TaskActivityDocument = TaskActivity & Document

@Schema({ timestamps: true })
export class TaskActivity {

  @Prop({ type: SchemaTypes.ObjectId, ref: "Task" })
  taskId: Types.ObjectId

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  userId: Types.ObjectId

  @Prop()
  action: string

  @Prop()
  message: string
}

export const TaskActivitySchema =
  SchemaFactory.createForClass(TaskActivity)