import { UserRole } from '../../common/enums/role-permission.enum';

export interface AuthPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
}

// Add this for JWT service compatibility
export type JwtPayload = Record<string, any> & AuthPayload;