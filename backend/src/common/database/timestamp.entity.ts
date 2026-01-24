import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimestampEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    //default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    //default: () => 'CURRENT_TIMESTAMP',
    //onUpdate: 'CURRENT_TIMESTAMP',
    })
  updatedAt: Date;
}