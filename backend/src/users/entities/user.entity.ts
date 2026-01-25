import { Entity, Column, PrimaryGeneratedColumn, Index} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/role-permission.enum';
import { SoftDeleteEntity } from 'src/common/database/softdelete.entity';

@Entity('users')
//@Index(['email'])
//@Index(['username'])
export class User extends SoftDeleteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ name: 'password_hash', select: false })
  @Exclude()
  passwordHash: string;

  @Column({
  type: 'enum',
  enum: UserRole,
  default: UserRole.ANALYST,
  })
  role: UserRole;
  
  @Column({ default: true })
  isActive: boolean;
  
  @Column({ name: 'refresh_token_hash', type : 'varchar', length: 255, nullable: true, select: false })
  refreshTokenHash?: string | null;


  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;
}