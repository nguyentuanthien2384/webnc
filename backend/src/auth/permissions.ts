import { UserRole } from '../users/schemas/user.schema';

/** Stable capability names returned to the client and enforced at API boundaries. */
export enum Permission {
  DOCUMENTS_UPLOAD = 'documents.upload',
  DOCUMENTS_UPDATE_OWN = 'documents.update_own',
  DOCUMENTS_DELETE_OWN = 'documents.delete_own',
  DOCUMENTS_DOWNLOAD = 'documents.download',
  REPORTS_CREATE = 'reports.create',
  DRAFTS_MANAGE_OWN = 'drafts.manage_own',
  DASHBOARD_VIEW = 'dashboard.view',
  STATISTICS_VIEW = 'statistics.view',
  REPORTS_REVIEW = 'reports.review',
  USERS_LIST = 'users.list',
  USERS_MODERATE = 'users.moderate',
  DOCUMENTS_REVIEW = 'documents.review',
  DOCUMENTS_MODERATE = 'documents.moderate',
  USERS_RESET_PASSWORD = 'users.reset_password',
  USERS_DELETE = 'users.delete',
  USERS_ASSIGN_ROLE = 'users.assign_role',
  ADMIN_DELEGATE = 'admin.delegate',
  DOCUMENTS_DELETE_ANY = 'documents.delete_any',
  AUDIT_VIEW = 'audit.view',
  CATALOG_MANAGE = 'catalog.manage',
  DOCUMENTS_GENERATE_THUMBNAILS = 'documents.generate_thumbnails',
}

const userPermissions = [
  Permission.DOCUMENTS_UPLOAD,
  Permission.DOCUMENTS_UPDATE_OWN,
  Permission.DOCUMENTS_DELETE_OWN,
  Permission.DOCUMENTS_DOWNLOAD,
  Permission.REPORTS_CREATE,
  Permission.DRAFTS_MANAGE_OWN,
];

const moderatorPermissions = [
  ...userPermissions,
  Permission.DASHBOARD_VIEW,
  Permission.STATISTICS_VIEW,
  Permission.REPORTS_REVIEW,
  Permission.USERS_LIST,
  Permission.USERS_MODERATE,
  Permission.DOCUMENTS_REVIEW,
  Permission.DOCUMENTS_MODERATE,
];

export const ROLE_PERMISSIONS: Readonly<
  Record<UserRole, readonly Permission[]>
> = {
  [UserRole.USER]: userPermissions,
  [UserRole.MODERATOR]: moderatorPermissions,
  [UserRole.ADMIN]: [
    ...moderatorPermissions,
    Permission.USERS_RESET_PASSWORD,
    Permission.USERS_DELETE,
    Permission.USERS_ASSIGN_ROLE,
    Permission.ADMIN_DELEGATE,
    Permission.DOCUMENTS_DELETE_ANY,
    Permission.AUDIT_VIEW,
    Permission.CATALOG_MANAGE,
    Permission.DOCUMENTS_GENERATE_THUMBNAILS,
  ],
};

export function getPermissionsForRole(role: UserRole | string): Permission[] {
  return [...(ROLE_PERMISSIONS[role as UserRole] ?? [])];
}

export function hasPermission(
  role: UserRole | string,
  permission: Permission,
): boolean {
  return (ROLE_PERMISSIONS[role as UserRole] ?? []).includes(permission);
}
