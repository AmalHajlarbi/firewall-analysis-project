import { DeleteDateColumn } from 'typeorm';
import { TimestampEntity } from './timestamp.entity';

export abstract class SoftDeleteEntity extends TimestampEntity {
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;
}
