import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisFilterDto } from './dto/analysis-filter.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/common/enums/role-permission.enum';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('analysis')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.ANALYZE_LOGS)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('statistics')
  //@Public()
  async getStatistics(@Query() query: AnalysisFilterDto) {
    return this.analysisService.statistics(query);
  }

  @Get('anomalies')
  //@Public()
  async getAnomalies(@Query() query: AnalysisFilterDto) {
    return this.analysisService.detectAnomalies(query);
  }
}