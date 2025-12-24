// src/common/database/softdelete.entity.ts
import { DeleteDateColumn } from 'typeorm';
import { TimestampEntity } from './timestamp.entity';

export abstract class SoftDeleteEntity extends TimestampEntity {
  @DeleteDateColumn({ 
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;

  // Helper method to check if entity is soft-deleted
  isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  // Helper method to restore
  restore(): void {
    this.deletedAt = null;
  }
}