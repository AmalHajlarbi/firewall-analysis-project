import { Injectable } from '@nestjs/common';
import { AnalysisService } from 'src/analysis/analysis.service'; 
import { InjectRepository } from '@nestjs/typeorm';
import {Repository} from 'typeorm' ;
import { ReportQueryDto } from './dto/report-query.dto';
import { exportToCsv } from './exporters/csv.exporter';
import { generatePdf } from './exporters/pdf.exporter';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { generateAnalysisPdf } from './exporters/analysis-pdf.exporter';
import { exportAnalysisToCsv } from './exporters/analysis-csv.exporter';

@Injectable()
export class ReportsService {
    constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly logRepository: Repository<FirewallLogEntity>,
      private readonly analysisService: AnalysisService,
  ) {}

  // =========================
  // LOGS BRUTS
  // =========================
  private async getFilteredLogs(query: ReportQueryDto) {
    const qb = this.logRepository.createQueryBuilder('log');

    if (query.from) qb.andWhere('log.timestamp >= :from', { from: query.from });
    if (query.to) qb.andWhere('log.timestamp <= :to', { to: query.to });
    if (query.firewallType) qb.andWhere('log.firewallType = :fw', { fw: query.firewallType });
    if (query.sourceIp) qb.andWhere('log.sourceIp = :ip', { ip: query.sourceIp });
    if (query.action) qb.andWhere('log.action = :action', { action: query.action });
    if (query.direction) qb.andWhere('log.direction = :direction', { direction: query.direction });

    return qb.getMany();
  }
  
  async exportCsv(query: ReportQueryDto) {
    const logs = await this.getFilteredLogs(query);
    return exportToCsv(logs);
  }

  async exportPdf(query: ReportQueryDto) {
    const logs = await this.getFilteredLogs(query);
    const buffer = await generatePdf(logs);
    return { filename: 'logs.pdf', content: buffer }; // buffer direct
  }

    // =========================
  // STATISTICS + ANOMALIES
  // =========================
  async exportAnalysis(query: ReportQueryDto) {
    const stats = await this.analysisService.statistics(query);
    const anomalies = await this.analysisService.detectAnomalies(query);

    if (query.format === 'pdf') {
      const buffer = await generateAnalysisPdf(stats, anomalies);
      return { filename: 'analysis.pdf', content: buffer };
    }

    const csv = exportAnalysisToCsv(stats, anomalies);
    return { filename: 'analysis.csv', content: csv };
  }
 
}
