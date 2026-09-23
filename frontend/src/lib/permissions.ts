import type { User, UserRole } from "@/@types/user.type";

// Keep these keys aligned with backend/src/auth/permissions.ts. The server
// remains authoritative; this map supports sessions created before the API
// started returning a permissions array.
export const ROLE_PERMISSIONS = {
  USER: [
    "documents.upload",
    "documents.update_own",
    "documents.delete_own",
    "documents.download",
    "reports.create",
    "drafts.manage_own",
  ],
  MODERATOR: [
    "documents.upload",
    "documents.update_own",
    "documents.delete_own",
    "documents.download",
    "reports.create",
    "drafts.manage_own",
    "dashboard.view",
    "statistics.view",
    "reports.review",
    "users.list",
    "users.moderate",
    "documents.review",
    "documents.moderate",
  ],
  ADMIN: [
    "documents.upload",
    "documents.update_own",
    "documents.delete_own",
    "documents.download",
    "reports.create",
    "drafts.manage_own",
    "dashboard.view",
    "statistics.view",
    "reports.review",
    "users.list",
    "users.moderate",
    "documents.review",
    "documents.moderate",
    "users.reset_password",
    "users.delete",
    "users.assign_role",
    "admin.delegate",
    "documents.delete_any",
    "audit.view",
    "catalog.manage",
    "documents.generate_thumbnails",
  ],
} as const satisfies Record<UserRole, readonly string[]>;

export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Thành viên",
  MODERATOR: "Kiểm duyệt viên",
  ADMIN: "Quản trị viên",
};

export function hasPermission(
  user: Pick<User, "role" | "permissions"> | null | undefined,
  permission: Permission,
): boolean {
  if (!user) return false;
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  return (ROLE_PERMISSIONS[user.role] as readonly string[] | undefined)?.includes(permission) ?? false;
}
