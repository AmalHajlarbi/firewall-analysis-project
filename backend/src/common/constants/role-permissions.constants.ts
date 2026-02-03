import { UserRole, Permission } from '../enums/role-permission.enum';

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    //Permission.UPLOAD_LOGS,
    //Permission.VIEW_LOGS,
    //Permission.ANALYZE_LOGS,
    //Permission.EXPORT_LOGS,
    //Permission.VIEW_DASHBOARD,
    //Permission.MANAGE_SYSTEM,
  ],
  [UserRole.ANALYST]: [
    Permission.VIEW_LOGS,
    Permission.UPLOAD_LOGS,
    Permission.ANALYZE_LOGS,
    Permission.EXPORT_LOGS,
    //Permission.VIEW_DASHBOARD,
  ],
};