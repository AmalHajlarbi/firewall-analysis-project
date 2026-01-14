import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
@Injectable()
export class AnalysisService {
   constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly repo: Repository<FirewallLogEntity>,
  ) {}

  async statistics() {
    const total = await this.repo.count();
    const allowed = await this.repo.count({ where: { action: 'ALLOW' } });
    const denied = await this.repo.count({ where: { action: 'DENY' } });

    const byProtocol = await this.repo
      .createQueryBuilder('log')
      .select('log.protocol', 'protocol')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.protocol')
      .getRawMany();

    return { total, allowed, denied, byProtocol };
  }

  async detectAnomalies() {
    const result = await this.repo
      .createQueryBuilder('log')
      .select('log.src_ip', 'ip')
      .addSelect('COUNT(*)', 'count')
      .where('log.action = :action', { action: 'DENY' })
      .groupBy('log.src_ip')
      .having('COUNT(*) > 50')
      .getRawMany();

    return result.map(r => ({
      ip: r.ip,
      type: 'MULTIPLE_DENY',
      level: 'HIGH',
      count: Number(r.count),
    }));
  }
  /*
  create(createAnalysisDto: CreateAnalysisDto) {
    return 'This action adds a new analysis';
  }

  findAll() {
    return `This action returns all analysis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} analysis`;
  }

  update(id: number, updateAnalysisDto: UpdateAnalysisDto) {
    return `This action updates a #${id} analysis`;
  }

  remove(id: number) {
    return `This action removes a #${id} analysis`;
  } */
}
