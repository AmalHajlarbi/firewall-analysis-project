import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';


@Module({
  imports: [TypeOrmModule.forFeature([FirewallLogEntity])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
   exports: [AnalysisService],
})
export class AnalysisModule {}