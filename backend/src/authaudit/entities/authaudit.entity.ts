import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, } from 'typeorm';
import { AuditAction, AuditStatus, AuditEntityType } from '../../common/enums/authaudit.enum';
import { UserRole } from '../../common/enums/role-permission.enum';

@Entity('authaudit')
export class AuthAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    type: 'enum', 
    enum: AuditAction,
    nullable: false 
  })
  @Index()
  action: AuditAction;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  userEmail?: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole,
    nullable: true 
  })
  userRole?: UserRole; 

  @Column({ 
    type: 'enum', 
    enum: AuditEntityType,
    nullable: true 
  })
  entityType?: AuditEntityType;

  @Column({ nullable: true })
  entityId?: string;

  @Column({ 
    type: 'enum', 
    enum: AuditStatus,
    default: AuditStatus.INFO 
  })
  @Index()
  status: AuditStatus;

  @Column({ nullable: true })
  error?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column('json', { nullable: true }) // Use simple-json instead of json
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;
}