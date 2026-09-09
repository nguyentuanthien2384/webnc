import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Document as DocumentEntity } from '../../documents/schemas/document.schema';

@Schema({ timestamps: true })
export class Log extends mongoose.Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  performedBy: User;

  @Prop({ required: true })
  action: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  targetUser: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Document' })
  targetDocument: DocumentEntity;

  @Prop()
  details: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ action: 1, createdAt: -1 });
