import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'Document', required: true })
  document: Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'User', required: true })
  reporter: Types.ObjectId;

  @Prop({ required: true, maxlength: 1000 })
  reason: string;

  @Prop({ enum: ['OPEN', 'RESOLVED', 'DISMISSED'], default: 'OPEN' })
  status: string;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: 'User' })
  resolvedBy?: Types.ObjectId;

  @Prop()
  resolvedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ document: 1, reporter: 1 }, { unique: true, partialFilterExpression: { status: 'OPEN' } });
