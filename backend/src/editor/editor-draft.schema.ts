import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema, Types } from 'mongoose';

@Schema({ collection: 'editor_drafts', timestamps: true })
export class EditorDraft extends Document {
  @Prop({
    type: MongoSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  owner: Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Document' })
  sourceDocument?: Types.ObjectId;

  @Prop({ required: true, maxlength: 120 })
  title: string;

  @Prop({ type: MongoSchema.Types.Mixed, required: true })
  content: Record<string, unknown>;

  @Prop({ default: 0 })
  version: number;

  createdAt: Date;
  updatedAt: Date;
}

export const EditorDraftSchema = SchemaFactory.createForClass(EditorDraft);
EditorDraftSchema.index(
  { owner: 1, sourceDocument: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceDocument: { $exists: true } },
  },
);
EditorDraftSchema.index({ owner: 1, updatedAt: -1 });
