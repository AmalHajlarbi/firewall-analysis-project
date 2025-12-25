import { Entity, Column, PrimaryGeneratedColumn, Index, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/role-permission.enum';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100 })
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

  //@Column({ default: false })
  //isVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
