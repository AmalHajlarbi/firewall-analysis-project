import { UserRole } from '../../common/enums/role-permission.enum';

export interface AuthPayload {
  sub: string; // user id
  email: string;
  username: string;
  role: UserRole;
}

export interface DecodedAuthPayload extends AuthPayload {
  iat: number; // issued at
  exp: number; // expires at
}