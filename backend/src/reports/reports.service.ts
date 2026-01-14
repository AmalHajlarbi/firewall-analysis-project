import { Injectable } from '@nestjs/common';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';import { InjectRepository } from '@nestjs/typeorm';
import {Repository} from 'typeorm' ;
import { ReportQueryDto } from './dto/report-query.dto';
import { exportToCsv } from './exporters/csv.exporter';
import { generatePdf } from './exporters/pdf.exporter';

@Injectable()
export class ReportsService {
    constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly logRepository: Repository<FirewallLogEntity>,
  ) {}
 
  
  async exportCsv(query: ReportQueryDto) {
    const logs = await this.logRepository.find();
    return exportToCsv(logs);
  }

  /*async exportPdf(query: ReportQueryDto) {
    const logs = await this.logRepository.find();
    return exportToPdf(logs);
  }*/

 async exportPdf(query: ReportQueryDto) {
  const logs = await this.logRepository.find();
  const buffer = await generatePdf(logs);
  return { filename: 'logs.pdf', content: buffer }; // buffer direct
}
 
}
