import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, SchemaTypes } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo',
  })
  status: string;

  @Prop({
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Workspace' })
  workspaceId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  assignee: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({
    type: [String],
    default: [],
  })
  labels: string[];

  @Prop()
  dueDate: Date;

  @Prop()
  coverColor: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: [Object], default: [] })
  checklist: Array<{ id: string, text: string, isCompleted: boolean }>;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Sprint' })
  sprintId: Types.ObjectId;

  // Sub-tasks: null means this is a top-level task
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Task', default: null })
  parentTaskId: Types.ObjectId | null;

  // Tasks that must be completed before this task can start
  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Task' }], default: [] })
  blockedBy: Types.ObjectId[];

  // Tasks that this task blocks (cannot start until this task is done)
  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'Task' }], default: [] })
  blocks: Types.ObjectId[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Full-text search index — used by SearchService
TaskSchema.index({ title: 'text', description: 'text' }, { name: 'task_text_idx', weights: { title: 3, description: 1 } });
