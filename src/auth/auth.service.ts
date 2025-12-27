import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  Logger,
  ConflictException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role-permission.enum';
import { AuthAuditService } from '../authaudit/authaudit.service';
import { AuditAction, AuditStatus } from '../common/enums/authaudit.enum';
import { AuthenticatedUser } from './interfaces/authenticated-request.interface';

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    isActive: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly maxLoginAttempts: number;
  private readonly lockDurationMinutes: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authAuditService: AuthAuditService,
  ) {
    this.maxLoginAttempts = this.configService.get<number>('security.maxLoginAttempts', 5);
    this.lockDurationMinutes = this.configService.get<number>('security.lockDurationMinutes', 15);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      await this.authAuditService.logLoginFailed(
        email,
        'User not found',
      );

      throw new UnauthorizedException('Invalid credentials');
    }
    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.authAuditService.logAuthEvent(
        AuditAction.ACCOUNT_LOCKED,
        user.id,
        user.email,
        user.role,
        AuditStatus.WARNING,
        'Login attempt on locked account',
      );

      throw new UnauthorizedException(
        `Account is locked. Try again later`,
      );
    }

    if (!user.isActive) {
      await this.authAuditService.logAuthEvent(
        AuditAction.ACCOUNT_DEACTIVATED,
        user.id,
        user.email,
        user.role,
        AuditStatus.WARNING,
        'Login attempt on deactivated account',
      );

      throw new UnauthorizedException('Account is deactivated');
    }
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.authAuditService.logLoginFailed(
        user.email,
        'Invalid password',
      );

      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await this.usersService.resetFailedAttempts(user.id);
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return user;
  }

  private async generateAndStoreTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>('security.jwtExpiresIn', 3600),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('security.jwtRefreshSecret'),
      expiresIn: this.configService.get<number>('security.jwtRefreshExpiresIn', 604800),
    });

    // Store hashed refresh token in DB
    await this.usersService.setCurrentRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    await this.authAuditService.logLoginSuccess(
      user.id,
      user.email,
      user.role,
    );

    const { accessToken, refreshToken } = await this.generateAndStoreTokens(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }


  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(registerDto);

    await this.authAuditService.logAuthEvent(
      AuditAction.REGISTER,
      user.id,
      user.email,
      user.role,
      AuditStatus.SUCCESS,
    );

    const { accessToken, refreshToken } = await this.generateAndStoreTokens(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }


  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {

    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    let payload: any;

    // Invalid or tampered refresh token
    try {
      payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('security.jwtRefreshSecret'),
      });
    } catch (error) {
      await this.authAuditService.logAuthEvent(
        AuditAction.REFRESH_TOKEN_FAILED,
        undefined,
        undefined,
        undefined,
        AuditStatus.FAILED,
        'Invalid or expired refresh token',
      );

      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;
    const user = await this.usersService.findOneWithPassword(userId);

    // User not found or inactive
    if (!user || !user.isActive) {
      await this.authAuditService.logAuthEvent(
        AuditAction.REFRESH_TOKEN_FAILED,
        user?.id,
        user?.email,
        user?.role,
        AuditStatus.FAILED,
        'User not found or inactive during refresh',
      );

      throw new UnauthorizedException('User not found or inactive');
    }

    // Refresh token mismatch (rotation protection)
    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash ?? '',
    );

    if (!isRefreshTokenValid) {
      await this.authAuditService.logAuthEvent(
        AuditAction.TOKEN_REVOKED,
        user.id,
        user.email,
        user.role,
        AuditStatus.WARNING,
        'Refresh token reuse or mismatch detected',
      );

      throw new UnauthorizedException('Invalid refresh token');
    }

    // Successful refresh
    const tokens = await this.generateAndStoreTokens(user);

    await this.authAuditService.logAuthEvent(
      AuditAction.REFRESH_TOKEN,
      user.id,
      user.email,
      user.role,
      AuditStatus.SUCCESS,
    );

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }
  private async handleFailedLogin(user: User): Promise<void> {
    const newAttempts = user.failedLoginAttempts + 1;

    if (newAttempts >= this.maxLoginAttempts) {
      await this.usersService.lockAccount(user.id, this.lockDurationMinutes);

      await this.authAuditService.logAccountLocked(
        user.id,
        user.email,
        undefined,
        `Locked after ${newAttempts} failed attempts`,
      );

      this.logger.warn(`Account ${user.email} locked`);
    } else {
      await this.usersService.incrementFailedAttempts(user.id);
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
    
    // If you still want to log the logout, you'd need to fetch the user first
    const user = await this.usersService.findOne(userId);
    if (user) {
      await this.authAuditService.logLogout(
        user.id,
        user.email,
        user.role,
      );
      this.logger.log(`User ${user.id} logged out`);
    }
  }


}