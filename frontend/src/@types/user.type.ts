// src/@types/user.type.ts
export type UserRole = "USER" | "MODERATOR" | "ADMIN";
export type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
  _id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  joinedDate: string;
  uploadsCount: number;
  downloadsCount: number;
}

export interface UpdateProfileDto {
  fullName?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
