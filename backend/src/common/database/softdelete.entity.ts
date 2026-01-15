import { Column } from 'typeorm';
import { TimestampEntity } from './timestamp.entity';

export abstract class SoftDeleteEntity extends TimestampEntity {
  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt: Date | null;
}
