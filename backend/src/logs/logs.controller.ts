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
import { UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../common/enums/role-permission.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 
import { randomUUID } from 'crypto';
import { Public } from 'src/auth/decorators/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';


@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  /**
   * Upload d'un fichier log
   */

  
  @Post('upload')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.UPLOAD_LOGS)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // dossier temporaire
        filename: (req, file, cb) => cb(null, file.originalname),
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
    @ApiOperation({ summary: 'Uploader un fichier de logs firewall' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'firewallType'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        firewallType: {
          type: 'string',
          enum: Object.values(FirewallType),
          example: FirewallType.WINDOWS_DEFENDER,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fichier traité avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Fichier invalide ou firewallType incorrect',
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    
    @Body('firewallType') firewallTypeStr: string,

) {
    if (!file) {
      throw new BadRequestException('Fichier manquant');
    }

    if (!firewallTypeStr) {
    throw new BadRequestException('firewallType est requis');
  }

  
    const firewallType = firewallTypeStr as FirewallType;
    if (!Object.values(FirewallType).includes(firewallType)) {
      throw new BadRequestException(
        `Type de firewall invalide. Valeurs autorisées : ${Object.values(FirewallType).join(', ')}`,
      );
    }

    

    const fileId = randomUUID();


    const fileStream = fs.createReadStream(file.path);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const lines: string[] = [];
    for await (const line of rl) {
      if (line.trim()) lines.push(line);
    }

    const result = await this.logsService.processMultipleLines(lines, firewallType, fileId);
  
    

    // Supprimer le fichier temporaire
    fs.unlinkSync(file.path);
    
    return {
      message: 'File processed successfully',
      fileId,
      linesProcessed: result.processed,
      linesIgnored: result.ignored,
      warning: result.warning,
    };
  }


    /**
   * Types de firewalls supportés
   */


@Get('supported-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.VIEW_LOGS)
@ApiOperation({ summary: 'Lister les types de firewall supportés' })
  @ApiResponse({
    status: 200,
    description: 'Liste des types supportés',
  })
  getSupportedTypes() {
    return Object.values(FirewallType);
  }


}
