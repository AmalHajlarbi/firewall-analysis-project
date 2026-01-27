import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirewallLogEntity } from './entities/firewall-log.entity';
import { ParsedLogDto } from './dto/parsed-log.dto';
import { validate } from 'class-validator';
import { WindowsDefenderLogParser } from './parsers/windows-defender-log.parser';
import { FirewallLogParser } from './parsers/firewall-log.parser';
import { FirewallType } from './enums/firewall-type.enum';
import { FortiGateLogParser } from './parsers/fortigate-log.parser';

@Injectable()
export class LogsService {

      private readonly parsers: FirewallLogParser[]; //ne doit pas etre modifiée

  constructor(
    @InjectRepository(FirewallLogEntity)
    private readonly logRepository: Repository<FirewallLogEntity>,
  ) {
    // Parsers enregistrés (extensible)
    this.parsers = [
      new WindowsDefenderLogParser(),
       new FortiGateLogParser(),
    ];
  }

  /**
   * Traite une ligne brute de log
   */
  async processLogLine(line: string, fileId: string): Promise<void> {

    if (!line.trim()) {
    console.log('Ligne vide ignorée');
    return;
  }
    const parser = this.parsers.find((p) => p.canParse(line));


    if (!parser) {
        console.log('Aucun parser compatible pour la ligne :', line.substring(0, 100) + '...');
      return; 
    }

    const parsedDto = parser.parse(line);

    if (!parsedDto) {
        console.log('Parse échoué (null retourné) pour la ligne :', line.substring(0, 100));
      return;
    }

    console.log('Parsed DTO:', parsedDto);

    const errors = await validate(parsedDto);

    if (errors.length > 0) {
      return;
    }

    const entity = this.logRepository.create(
        {...parsedDto,
            timestamp: parsedDto.timestamp,
            firewallType: parsedDto.firewallType,
            fileId,

        });
    try{
    await this.logRepository.save(entity);
    console.log('Entity ready to save:', entity);
    } catch (err) {
        console.error('Error saving entity:', err);
    }
    
    console.log(entity);
    
  }



  /**
   * Traitement de plusieurs lignes 
   */
async processMultipleLines(lines: string[], selectedType: FirewallType, fileId: string): Promise<{
  processed: number;
  ignored: number;
  warning?: string;
}> {
  let processed = 0;
  let ignored = 0;

  for (const line of lines) {
    if (!line.trim()) {
      ignored++;
      continue;
    }

    const parser = this.parsers.find(p => p.canParse(line) && p.firewallType === selectedType);

    if (!parser) {
      ignored++;
      continue;
    }

    await this.processLogLine(line, fileId); 
    processed++;
  }

   const result: {
    processed: number;
    ignored: number;
    warning?: string;
  } = {
    processed,
    ignored,
  };
  if (processed === 0 && lines.length > ignored) {
    result.warning = `Aucune ligne valide trouvée pour le type ${selectedType}`;
  }

  return result;
}



}