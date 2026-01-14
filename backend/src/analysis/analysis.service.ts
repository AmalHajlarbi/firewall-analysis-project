import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { AnalysisFilterDto } from './dto/analysis-filter.dto';
import { Anomaly, AlertLevel, AnomalyResponse } from './interfaces/anomaly-response.interface';
import { StatisticsResponse } from './interfaces/statistics-response.interface';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly repo: Repository<FirewallLogEntity>,
  ) {}

  // =========================
  // STATISTICS
  // =========================
  async statistics(filters?: AnalysisFilterDto): Promise<StatisticsResponse> {
    const qb = this.repo.createQueryBuilder('log');

    if (filters?.from) qb.andWhere('log.timestamp >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('log.timestamp <= :to', { to: filters.to });
    if (filters?.protocol) qb.andWhere('log.protocol = :protocol', { protocol: filters.protocol });
    if (filters?.firewallType) qb.andWhere('log.firewallType = :firewallType', { firewallType: filters.firewallType });
    if (filters?.direction) qb.andWhere('log.direction = :direction', { direction: filters.direction });

    const total = await qb.clone().getCount();

    const allowed = await qb.clone()
      .andWhere("log.action = 'ALLOW'")
      .getCount();

    const droped = await qb.clone()
      .andWhere("log.action = 'DROP'")
      .getCount();

    const byProtocol = await qb.clone()
      .select('log.protocol', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.protocol')
      .getRawMany();

    const ratioByProtocol = await qb.clone()
      .select('log.protocol', 'protocol')
      .addSelect("SUM(CASE WHEN log.action = 'ALLOW' THEN 1 ELSE 0 END)", 'allowCount')
      .addSelect("SUM(CASE WHEN log.action = 'DROP' THEN 1 ELSE 0 END)", 'dropCount')
      .groupBy('log.protocol')
      .getRawMany();

    const byDirection = await qb.clone()
      .select('log.direction', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.direction')
      .getRawMany();

    const byFirewallType = await qb.clone()
      .select('log.firewallType', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.firewallType')
      .getRawMany();

    const bySourcePort = await qb.clone()
      .select('log.sourcePort', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.sourcePort')
      .getRawMany();

    const byDestinationPort = await qb.clone()
      .select('log.destinationPort', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.destinationPort')
      .getRawMany();

    const topSourceIp = await qb.clone()
      .select('log.sourceIp', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.sourceIp')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topDestinationIp = await qb.clone()
      .select('log.destinationIp', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.destinationIp')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      total,
      allowed,
      droped,
      byProtocol,
      ratioByProtocol,
      byDirection,
      byFirewallType,
      bySourcePort,
      byDestinationPort,
      topSourceIp,
      topDestinationIp,
    };
  }

  // =========================
  // ANOMALIES
  // =========================
  async detectAnomalies(filters?: AnalysisFilterDto): Promise<AnomalyResponse> {
    const qb = this.repo.createQueryBuilder('log');

    if (filters?.from) qb.andWhere('log.timestamp >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('log.timestamp <= :to', { to: filters.to });

    const anomalies: Anomaly[] = [];

    const multipleDrop = await qb.clone()
      .select('log.sourceIp', 'ip')
      .addSelect('COUNT(*)', 'count')
      .where("log.action = 'DROP'")
      .groupBy('log.sourceIp')
      .having('COUNT(*) > 50')
      .getRawMany();

    multipleDrop.forEach(r =>
      anomalies.push({
        type: 'MULTIPLE_DROP',
        level: AlertLevel.HIGH,
        ip: r.ip,
        count: Number(r.count),
      }),
    );

    const bruteForce = await qb.clone()
      .select('log.sourceIp', 'ip')
      .addSelect('COUNT(DISTINCT log.destinationPort)', 'ports')
      .where("log.action = 'DROP'")
      .groupBy('log.sourceIp')
      .having('COUNT(DISTINCT log.destinationPort) > 20')
      .getRawMany();

    bruteForce.forEach(r =>
      anomalies.push({
        type: 'BRUTE_FORCE',
        level: AlertLevel.HIGH,
        ip: r.ip,
        ports: Number(r.ports),
      }),
    );

    return { anomalies };
  }
}