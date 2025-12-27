import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LogsService } from './logs.service';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as readline from 'readline';
import { UploadLogDto } from './dto/upload-log.dto';
import { FirewallType } from './enums/firewall-type.enum';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * Upload d'un fichier log
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // dossier temporaire
        filename: (req, file, cb) => cb(null, file.originalname),
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    //@Body() body: UploadLogDto,
    @Body('firewallType') firewallTypeStr: string,

) {
    if (!file) {
      throw new BadRequestException('Fichier manquant');
    }

    if (!firewallTypeStr) {
    throw new BadRequestException('firewallType est requis');
  }

  // Validation manuelle du type
    const firewallType = firewallTypeStr as FirewallType;
    if (!Object.values(FirewallType).includes(firewallType)) {
      throw new BadRequestException(
        `Type de firewall invalide. Valeurs autorisées : ${Object.values(FirewallType).join(', ')}`,
      );
    }

    //const selectedType: FirewallType = firewallTypeStr;

    const fileStream = fs.createReadStream(file.path);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const lines: string[] = [];
    for await (const line of rl) {
      if (line.trim()) lines.push(line);
    }

    const result = await this.logsService.processMultipleLines(lines, firewallType);
  
    //await this.logsService.processMultipleLines(lines);

    // Supprimer le fichier temporaire
    fs.unlinkSync(file.path);
    console.log("upload yekhdem")
    return {
      message: 'Fichier traité avec succès',
      linesProcessed: result.processed,
      linesIgnored: result.ignored,
      warning: result.warning,
    };
  }


@Get('supported-types')
  getSupportedTypes() {
    return Object.values(FirewallType);
  }


}

