import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthPayload } from '../interfaces/auth-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-request.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {     
    // Get secret first (no 'this' usage yet)
    const secret = configService.get<string>('security.jwtSecret');
    
    // Validate secret before calling super()
    if (!secret) {
      // Can't use this.logger here, use console.error instead
      console.error('❌ JWT_SECRET is not configured in environment variables');
      throw new Error('JWT secret is not configured');
    }
    
    // Call super() FIRST
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
    
    this.logger = new Logger(JwtStrategy.name);
    this.logger.log('JWT Strategy initialized');
  }

  async validate(payload: AuthPayload): Promise<AuthenticatedUser> {
    this.logger.debug(`Validating JWT for user: ${payload.sub}`);
    
    try {
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        this.logger.warn(`User not found for JWT sub: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }
      
      if (!user.isActive) {
        this.logger.warn(`Inactive user attempted login: ${user.email}`);
        throw new UnauthorizedException('User account is deactivated');
      }
      
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        this.logger.warn(`Locked user attempted login: ${user.email}`);
        throw new UnauthorizedException('User account is locked');
      }

      this.logger.debug(`JWT validation successful for user: ${user.email}`);
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      };
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }
}