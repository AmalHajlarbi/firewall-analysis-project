import { Request } from 'express';
import { UserRole } from '../../common/enums/role-permission.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}