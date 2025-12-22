import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from 'src/logs/entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
