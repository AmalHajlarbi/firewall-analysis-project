import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from 'src/logs/entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
