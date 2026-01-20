import { Controller, Get, Res, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('logsbruts/csv')
  async exportCsv(@Query() query: ReportQueryDto, @Res() res: Response) {
    const { filename, content } = await this.reportsService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Get('logsbruts/pdf')
  async exportPdf(@Query() query: ReportQueryDto, @Res() res: Response) {
    const { filename, content } = await this.reportsService.exportPdf(query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content); 
  }

  @Get('analysis')
  async exportAnalysis(@Query() query: ReportQueryDto, @Res() res: Response) {
    const file = await this.reportsService.exportAnalysis(query);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

    if (file.filename.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.send(file.content);
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.send(file.content);
    }
  }
}
