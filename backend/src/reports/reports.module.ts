import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
@Module({
  imports: [TypeOrmModule.forFeature([FirewallLogEntity])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
