import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // Add unique constraint
  token: string;

  @Column() // ✅ ADD THIS: The actual foreign key column
  userId: number;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column() // Change from `type: 'datetime'`
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // ✅ Optional: Helper methods for clarity
  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}