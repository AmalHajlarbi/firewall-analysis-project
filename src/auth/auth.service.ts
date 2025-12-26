// src/auth/auth.service.ts
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
import { AuthPayload } from './interfaces/auth-payload.interface';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role-permission.enum';

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
  ) {
    this.maxLoginAttempts = this.configService.get<number>('security.maxLoginAttempts', 5);
    this.lockDurationMinutes = this.configService.get<number>('security.lockDurationMinutes', 15);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
        this.logger.warn(`Failed login attempt for non-existent email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account is locked. Try again in ${remainingMinutes} minutes`,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
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
  const { accessToken, refreshToken } = await this.generateAndStoreTokens(user);
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, isActive: user.isActive },
  };
}

async register(registerDto: RegisterDto): Promise<AuthResponse> {
  const user = await this.usersService.create(registerDto);
  const { accessToken, refreshToken } = await this.generateAndStoreTokens(user);
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, isActive: user.isActive },
  };
}

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  if (!refreshToken) {
    throw new BadRequestException('Refresh token is required');
  }
  let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('security.jwtRefreshSecret'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = payload.sub;
    const user = await this.usersService.findOneWithPassword(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash ?? '');
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('security.jwtRefreshSecret'),
      expiresIn: this.configService.get<number>('security.jwtRefreshExpiresIn', 604800),
    });

    await this.usersService.setCurrentRefreshToken(userId, newRefreshToken);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    }, {
      expiresIn: this.configService.get<number>('security.jwtExpiresIn', 3600),
    });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }


  private async handleFailedLogin(user: User): Promise<void> {
    const newAttempts = user.failedLoginAttempts + 1;
    
    if (newAttempts >= this.maxLoginAttempts) {
      // Lock account
      await this.usersService.lockAccount(user.id, this.lockDurationMinutes);
      this.logger.warn(`Account ${user.email} locked due to ${newAttempts} failed attempts`);
    } else {
      // Increment failed attempts
      await this.usersService.incrementFailedAttempts(user.id);
      this.logger.warn(`Failed login attempt ${newAttempts}/${this.maxLoginAttempts} for ${user.email}`);
    }
  }

  async logout(userId: string): Promise<void> {
    // Remove stored refresh token
    await this.usersService.removeRefreshToken(userId);
    this.logger.log(`User ${userId} logged out and refresh token removed`);
  }

}