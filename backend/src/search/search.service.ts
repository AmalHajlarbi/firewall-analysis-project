import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SearchLogsDto } from './dto/search-logs.dto';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { FirewallLog } from 'src/logs/interfaces/firewall-log.interface';

@Injectable()
export class SearchService {
    constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly logRepo: Repository<FirewallLogEntity>,
  ) {}

  async search(dto: SearchLogsDto) {
    const qb = this.logRepo.createQueryBuilder('log');

    if (dto.action) 
      qb.andWhere('log.action = :action', { action: dto.action });

    if (dto.protocol)
      qb.andWhere('log.protocol = :protocol', { protocol: dto.protocol });

    if (dto.sourceIp)
      qb.andWhere('log.sourceIp = :sourceIp', { sourceIp: dto.sourceIp });

    if (dto.destinationIp)
      qb.andWhere('log.destinationIp = :destinationIp', { destinationIp: dto.destinationIp });
    
    if (dto.sourcePort)
      qb.andWhere('log.sourcePort = :sourcePort', { sourcePort: dto.sourcePort });  
    
    if (dto.destinationPort)
      qb.andWhere('log.destinationPort = :destinationPort', { destinationPort: dto.destinationPort });
 
    if (dto.firewallType)
      qb.andWhere('log.firewallType = :firewallType', { firewallType: dto.firewallType });

    if (dto.from) {
      qb.andWhere('log.timestamp >= :from', {
        from: new Date(dto.from),
      });
    }

    if (dto.to) {
      qb.andWhere('log.timestamp <= :to', {
        to: new Date(dto.to),
      });
    }

    if (dto.direction) // SEND / RECEIVE / INBOUND / OUTBOUND /...
      qb.andWhere('log.direction = :direction', { direction: dto.direction });

    const page = dto.page || 1;
    const limit = dto.limit || 20;

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { total, page, limit, data };
  }
}