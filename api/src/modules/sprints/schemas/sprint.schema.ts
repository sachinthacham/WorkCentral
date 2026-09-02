import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type SprintDocument = Sprint & Document;

@Schema({ timestamps: true })
export class Sprint {
  @Prop({ required: true })
  name: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({
    enum: ['PLANNED', 'ACTIVE', 'CLOSED'],
    default: 'PLANNED',
  })
  status: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;
}

export const SprintSchema = SchemaFactory.createForClass(Sprint);
