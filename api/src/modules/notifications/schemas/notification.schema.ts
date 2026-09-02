import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document, Types, SchemaTypes } from "mongoose"

export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })
export class Notification {

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  userId: Types.ObjectId

  @Prop()
  message: string

  @Prop()
  type: string

  @Prop({ default: false })
  isRead: boolean

}

export const NotificationSchema =
  SchemaFactory.createForClass(Notification)