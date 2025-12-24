import { Entity, Column, PrimaryGeneratedColumn, Index, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { SoftDeleteEntity } from '../../common/database/softdelete.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
@Index(['isActive', 'deletedAt']) 
export class User extends SoftDeleteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100 })
  username: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }
}