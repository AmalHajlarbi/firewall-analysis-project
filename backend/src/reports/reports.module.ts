import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { AnalysisModule } from 'src/analysis/analysis.module';


@Module({
  imports: [TypeOrmModule.forFeature([FirewallLogEntity]), 
  AnalysisModule,
],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}