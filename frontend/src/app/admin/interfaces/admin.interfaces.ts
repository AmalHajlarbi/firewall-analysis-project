import { UserRole } from '../enums/user-role.enum';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  lockedUntil?: string | null;
  failedLoginAttempts: number;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;

  role?: UserRole;      
  isActive?: boolean;  
}

export interface UsersPageResponse {
  users: AdminUser[];
  total: number;
  page: number;
  lastPage: number;
}


