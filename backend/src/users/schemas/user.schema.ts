import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

@Schema({ timestamps: { createdAt: 'joinedDate', updatedAt: true } })
export class User extends Document {
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 0 })
  tokenVersion: number;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: null })
  avatarUrl: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Prop({ default: 0 })
  uploadsCount: number;

  @Prop({ default: 0 })
  downloadsCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Một unique partial index chỉ áp dụng với role ADMIN: MongoDB sẽ không thể
// lưu đồng thời hai tài khoản Admin, trong khi USER/MODERATOR vẫn không bị giới hạn.
UserSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: UserRole.ADMIN },
    name: 'single_admin_role',
  },
);
