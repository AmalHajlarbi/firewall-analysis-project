import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisFilterDto } from './dto/analysis-filter.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('statistics')
  @Public()
  async getStatistics(@Query() query: AnalysisFilterDto) {
    return this.analysisService.statistics(query);
  }

  @Get('anomalies')
  @Public()
  async getAnomalies(@Query() query: AnalysisFilterDto) {
    return this.analysisService.detectAnomalies(query);
  }
}