import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable()
  roles: Role[];

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail(): void {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return this.lockedUntil > new Date();
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = undefined;
  }

  incrementLoginAttempts(maxAttempts: number = 5, lockMinutes: number = 15): void {
    this.loginAttempts += 1;
    if (this.loginAttempts >= maxAttempts) {
      this.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    }
  }

  get isLockedOut(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }
}