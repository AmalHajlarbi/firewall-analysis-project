import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { FirewallType } from '../enums/firewall-type.enum';

@Entity('firewall_logs')
// les indexes sur les parties critiques pour accélérer les requetes
@Index(['timestamp'])
@Index(['action'])
@Index(['sourceIp'])
@Index(['destinationIp'])
@Index(['firewallType'])
export class FirewallLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 10 })
  action: string; // ALLOW / DROP

  @Column({ type: 'varchar', length: 10 })
  protocol: string; // TCP / UDP / ICMP...

  @Column({ type: 'varchar', length: 45 })
  sourceIp: string;

  @Column({ type: 'int', nullable: true })
  sourcePort?: number;

  @Column({ type: 'varchar', length: 45 }) //compatible avec ipv6 = 45 char (ipv4 = 15 char)
  destinationIp: string;

  @Column({ type: 'int', nullable: true })
  destinationPort?: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  direction?: string; // SEND / RECEIVE / INBOUND / OUTBOUND /...

  @Column({
    type: 'enum',
    enum: FirewallType,
  })
  firewallType: FirewallType;

  @Column({ type: 'text' })
  rawLog: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'uuid'})
  fileId: string;
}
