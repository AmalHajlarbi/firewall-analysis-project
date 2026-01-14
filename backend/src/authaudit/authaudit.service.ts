import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AuthAudit } from './entities/authaudit.entity';
import { AuditAction, AuditStatus, AuditEntityType } from '../common/enums/authaudit.enum';
import { UserRole } from '../common/enums/role-permission.enum';

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger(AuthAuditService.name);

  constructor(
    @InjectRepository(AuthAudit)
    private auditLogRepository: Repository<AuthAudit>,
  ) {}

  async logAuthEvent(
    action: AuditAction,
    userId?: string,
    userEmail?: string,
    userRole?: UserRole, 
    status: AuditStatus = AuditStatus.INFO,
    error?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>,
  ): Promise<AuthAudit | null> {
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        userId,
        userEmail,
        userRole,
        entityType: AuditEntityType.AUTH,
        entityId: userId,
        status,
        error,
        ipAddress,
        userAgent,
        metadata,
      });

      const savedLog = await this.auditLogRepository.save(auditLog);
      this.logger.debug(`Auth audit logged: ${action} - ${status}`);
      
      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to log auth audit: ${error.message}`);
      return null;
    }
  }

  // Specific auth event methods
  async logLoginSuccess(
    userId: string,
    userEmail: string,
    userRole: UserRole, 
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthAudit | null> {
    return this.logAuthEvent(
      AuditAction.LOGIN,
      userId,
      userEmail,
      userRole,
      AuditStatus.SUCCESS,
      undefined,
      ipAddress,
      userAgent,
      { timestamp: new Date().toISOString() },
    );
  }

  async logLoginFailed(
    email: string,
    error: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthAudit | null> {
    return this.logAuthEvent(
      AuditAction.LOGIN_FAILED,
      undefined,
      email,
      undefined,
      AuditStatus.FAILED,
      error,
      ipAddress,
      userAgent,
      { attemptTimestamp: new Date().toISOString() },
    );
  }

  async logLogout(
    userId: string,
    userEmail: string,
    userRole: UserRole,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthAudit | null> {
    return this.logAuthEvent(
      AuditAction.LOGOUT,
      userId,
      userEmail,
      userRole,
      AuditStatus.INFO,
      undefined,
      ipAddress,
      userAgent,
    );
  }

  async logBruteForceAttempt(
    email: string,
    ipAddress?: string,
    failedAttempts?: number,
  ): Promise<AuthAudit | null> {
    return this.logAuthEvent(
      AuditAction.BRUTE_FORCE_ATTEMPT,
      undefined,
      email,
      undefined,
      AuditStatus.WARNING,
      failedAttempts ? `Multiple failed login attempts: ${failedAttempts}` : 'Multiple failed login attempts',
      ipAddress,
      undefined,
      { 
        failedAttempts: failedAttempts || 0, 
        timestamp: new Date().toISOString() 
      },
    );
  }

  async logAccountLocked(
    userId: string,
    userEmail: string,
    ipAddress?: string,
    reason?: string,
  ): Promise<AuthAudit | null> {
    return this.logAuthEvent(
      AuditAction.ACCOUNT_LOCKED,
      userId,
      userEmail,
      undefined,
      AuditStatus.WARNING,
      reason,
      ipAddress,
      undefined,
      { 
        lockTimestamp: new Date().toISOString(),
        reason: reason || 'Unknown reason'
      },
    );
  }

  // Query methods for auth events
  async getUserAuthHistory(
    userId: string,
    limit: number = 50,
  ): Promise<AuthAudit[]> {
    const logs = await this.auditLogRepository.find({
      where: { userId, entityType: AuditEntityType.AUTH },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    
    return logs; // This returns AuditLog[], which is correct
  }

  async getFailedLoginAttempts(
    email: string,
    hours: number = 24,
  ): Promise<number> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return this.auditLogRepository.count({
      where: {
        userEmail: email,
        action: AuditAction.LOGIN_FAILED,
        createdAt: MoreThan(since),
      },
    });
  }

  async getIpLoginHistory(
    ipAddress: string,
    hours: number = 1,
  ): Promise<AuthAudit[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const logs = await this.auditLogRepository.find({
      where: {
        ipAddress,
        action: AuditAction.LOGIN,
        createdAt: MoreThan(since),
      },
      order: { createdAt: 'DESC' },
    });
    
    return logs; 
  }
}