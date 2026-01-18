import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisFilterDto } from './dto/analysis-filter.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('statistics')
  getStatistics(@Query() query: AnalysisFilterDto) {
    return this.analysisService.statistics(query);
  }

  @Get('anomalies')
  getAnomalies(@Query() query: AnalysisFilterDto) {
    return this.analysisService.detectAnomalies(query);
  }
}