import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { AnalysisFilterDto } from './dto/analysis-filter.dto';
import { Anomaly, AlertLevel, AnomalyResponse, AnomalyType } from './interfaces/anomaly-response.interface';
import { StatisticsResponse } from './interfaces/statistics-response.interface';

const ANOMALY_THRESHOLDS = {
  MULTIPLE_DROP_COUNT: 50,
  BRUTE_FORCE_PORTS: 20,
};

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly repo: Repository<FirewallLogEntity>,
  ) {}

  // =========================
  // STATISTICS
  // =========================
  async statistics(filters: AnalysisFilterDto): Promise<StatisticsResponse> {
    if (!filters.fileId) {
      throw new Error('fileId is required');
    }

    const qb = this.repo.createQueryBuilder('log')
    .where('log.fileId = :fileId', { fileId: filters.fileId });

    if (filters?.from) qb.andWhere('log.timestamp >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('log.timestamp <= :to', { to: filters.to });
    if (filters?.protocol) qb.andWhere('log.protocol = :protocol', { protocol: filters.protocol });
    if (filters?.firewallType) qb.andWhere('log.firewallType = :firewallType', { firewallType: filters.firewallType });
    if (filters?.direction) qb.andWhere('log.direction = :direction', { direction: filters.direction });

    const total = await qb.clone().getCount();

    const allowed = await qb.clone()
      .andWhere("log.action = 'ALLOW'")
      .getCount();

    const dropped = await qb.clone()
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
      dropped,
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
  async detectAnomalies(filters: AnalysisFilterDto): Promise<AnomalyResponse> {
    if (!filters.fileId) {
      throw new Error('fileId is required');
    }
    const qb = this.repo.createQueryBuilder('log')
    .where('log.fileId = :fileId', { fileId: filters.fileId });
    
    if (filters?.from) qb.andWhere('log.timestamp >= :from', { from: filters.from });
    if (filters?.to) qb.andWhere('log.timestamp <= :to', { to: filters.to });

    const anomalies: Anomaly[] = [];

    const multipleDrop = await qb.clone()
      .select('log.sourceIp', 'ip')
      .addSelect('COUNT(*)', 'count')
      .andWhere("log.action = 'DROP'")
      .groupBy('log.sourceIp')
      .having('COUNT(*) > :threshold', {
        threshold: ANOMALY_THRESHOLDS.MULTIPLE_DROP_COUNT,
      })
      .getRawMany();

    multipleDrop.forEach(r =>
      anomalies.push({
        type: AnomalyType.MULTIPLE_DROP,
        level: AlertLevel.HIGH,
        ip: r.ip,
        count: Number(r.count),
      }),
    );

    const bruteForce = await qb.clone()
      .select('log.sourceIp', 'ip')
      .addSelect('COUNT(DISTINCT log.destinationPort)', 'ports')
      .andWhere("log.action = 'DROP'")
      .groupBy('log.sourceIp')
      .having('COUNT(DISTINCT log.destinationPort) > :threshold', {
        threshold: ANOMALY_THRESHOLDS.BRUTE_FORCE_PORTS,
      })
      .getRawMany();

    bruteForce.forEach(r =>
      anomalies.push({
        type: AnomalyType.BRUTE_FORCE,
        level: AlertLevel.HIGH,
        ip: r.ip,
        ports: Number(r.ports),
      }),
    );

    return { anomalies };
  }
}