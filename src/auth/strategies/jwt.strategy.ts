import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthPayload } from '../interfaces/auth-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-request.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('security.jwtSecret')!,//check this line later 
    });
  }

  async validate(payload: AuthPayload): Promise<AuthenticatedUser> {
    try {
      const user = await this.usersService.findOne(payload.sub);
      
      // Check if user exists and is active
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }
      
      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException('User account is locked');
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }
}