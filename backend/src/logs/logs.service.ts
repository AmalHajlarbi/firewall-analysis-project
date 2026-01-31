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
async processLogLine(
  line: string,
  selectedType: FirewallType,
  fileId: string
): Promise<{ success: boolean; matchedType?: FirewallType }> {

  if (!line.trim()) {
    return { success: false };
  }

  // Match parser by selected firewall type
  const parser = this.parsers.find(
    p => p.firewallType === selectedType && p.canParse(line)
  );

  if (!parser) {
    return { success: false };
  }

  const parsedDto = parser.parse(line);

  if (!parsedDto) {
    return { success: false };
  }

  const errors = await validate(parsedDto);
  if (errors.length > 0) {
    return { success: false };
  }

  const entity = this.logRepository.create({
    ...parsedDto,
    firewallType: selectedType,
    fileId,
  });

  await this.logRepository.save(entity);

  return {
    success: true,
    matchedType: parser.firewallType,
  };
}

  /**
   * Traitement de plusieurs lignes 
   */


  async processMultipleLines(
  lines: string[],
  selectedType: FirewallType,
  fileId: string
): Promise<{
  processed: number;
  ignored: number;
  warning?: string;
}> {

  let processed = 0;
  let ignored = 0;

  const detectedTypeCounter = new Map<FirewallType, number>();
  let totalMatchingLines = 0;

  for (const line of lines) {
    if (!line.trim()) {
      ignored++;
      continue;
    }

    // Try parsing with selected type
    const parser = this.parsers.find(
      p => p.firewallType === selectedType && p.canParse(line)
    );

    if (parser) {
      await this.processLogLine(line, selectedType, fileId);
      processed++;
      continue;
    }

    // If selected parser failed, try detect other parsers
    let matchedAny = false;

    for (const otherParser of this.parsers) {
      if (otherParser.canParse(line)) {
        matchedAny = true;
        totalMatchingLines++;

        detectedTypeCounter.set(
          otherParser.firewallType,
          (detectedTypeCounter.get(otherParser.firewallType) || 0) + 1
        );
      }
    }

    ignored++;
  }

  let warning: string | undefined;

  if (processed === 0 && totalMatchingLines === 0) {
    warning = `Firewall type not supported or file format unknown`;
  }

  else if (processed === 0 && detectedTypeCounter.size > 0) {
    const [bestMatch] = [...detectedTypeCounter.entries()]
      .sort((a, b) => b[1] - a[1])[0];

    if (bestMatch !== selectedType) {
      warning = `Selected firewall type (${selectedType}) seems incorrect. Detected: ${bestMatch}`;
    }
  }

  return { processed, ignored, warning };
}



}