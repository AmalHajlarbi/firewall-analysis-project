import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchLogsDto } from './dto/search-logs.dto';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly logRepo: Repository<FirewallLogEntity>,
  ) {}

  async search(dto: SearchLogsDto) {
    const qb = this.logRepo.createQueryBuilder('log');

    this.applyFilters(qb, dto);
    this.applyPagination(qb, dto);

    const [entities, total] = await qb.getManyAndCount();

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const data = entities.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      protocol: log.protocol,
      sourceIp: log.sourceIp,
      sourcePort: log.sourcePort,
      destinationIp: log.destinationIp,
      destinationPort: log.destinationPort,
      direction: log.direction ?? 'UNKNOWN',
      firewallType: log.firewallType,
    }));

    return { total, page, limit, data };
  }

  private applyFilters(
    qb: SelectQueryBuilder<FirewallLogEntity>,
    dto: SearchLogsDto,
  ) {
    if (dto.action)
      qb.andWhere('log.action = :action', { action: dto.action });

    if (dto.protocol)
      qb.andWhere('log.protocol = :protocol', { protocol: dto.protocol });

    if (dto.sourceIp)
      qb.andWhere('log.sourceIp = :sourceIp', { sourceIp: dto.sourceIp });

    if (dto.destinationIp)
      qb.andWhere('log.destinationIp = :destinationIp', {
        destinationIp: dto.destinationIp,
      });

    if (dto.firewallType)
      qb.andWhere('log.firewallType = :firewallType', {
        firewallType: dto.firewallType,
      });

    if (dto.from)
      qb.andWhere('log.timestamp >= :from', {
        from: new Date(dto.from),
      });

    if (dto.to)
      qb.andWhere('log.timestamp <= :to', {
        to: new Date(dto.to),
      });

    if (dto.direction)
      qb.andWhere('log.direction = :direction', {
        direction: dto.direction,
      });
  }

  private applyPagination(
    qb: SelectQueryBuilder<FirewallLogEntity>,
    dto: SearchLogsDto,
  ) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);
  }
}
