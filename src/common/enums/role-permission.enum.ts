export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
}

export enum Permission {
  // User management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  
  // Log management
  UPLOAD_LOGS = 'upload_logs',
  VIEW_LOGS = 'view_logs',
  ANALYZE_LOGS = 'analyze_logs',
  EXPORT_LOGS = 'export_logs',
  
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  
  // System
  MANAGE_SYSTEM = 'manage_system',
}

