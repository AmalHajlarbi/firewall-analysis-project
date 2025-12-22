import { Controller, Get, Res, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

import { ReportQueryDto } from './dto/report-query.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
/*
  @Get('export/csv')
  exportCsv(@Query() query: ReportQueryDto) {
    return this.reportsService.exportCsv(query);
  }

  @Get('export/pdf')
  exportPdf(@Query() query: ReportQueryDto) {
    return this.reportsService.exportPdf(query);
  }
    */
    // Télécharger le CSV
  @Get('export/csv')
  async exportCsv(@Query() query: ReportQueryDto, @Res() res: Response) {
    const { filename, content } = await this.reportsService.exportCsv(query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  // Télécharger le PDF
  @Get('export/pdf')
  async exportPdf(@Query() query: ReportQueryDto, @Res() res: Response) {
    const { filename, content } = await this.reportsService.exportPdf(query);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content); // Décoder base64 pour renvoyer le fichier
  }
}
