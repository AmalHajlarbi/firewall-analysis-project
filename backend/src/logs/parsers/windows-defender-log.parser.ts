import { FirewallLogParser } from './firewall-log.parser';
import { FirewallType } from '../enums/firewall-type.enum';
import { ParsedLogDto } from '../dto/parsed-log.dto';
import { plainToInstance } from 'class-transformer';

export class WindowsDefenderLogParser implements FirewallLogParser {
  readonly firewallType = FirewallType.WINDOWS_DEFENDER;

  canParse(line: string): boolean {
    return !line.startsWith('#') && (line.includes('DROP') || line.includes('ALLOW'));
  }

  parse(line: string): ParsedLogDto | null {
    const parts = line.trim().split(/\s+/);

    if (parts.length < 8) return null;

    const [
      date,
      time,
      action,
      protocol,
      sourceIp,
      destinationIp,
      sourcePort,
      destinationPort,
      , , , , , , ,
      direction,
    ] = parts;

    const timestamp = new Date(`${date} ${time}`);

    if (isNaN(timestamp.getTime())) {
      return null;
    }

    const parsedLog: ParsedLogDto = {
      timestamp,
      action,
      protocol,
      sourceIp,
      destinationIp,
      firewallType: FirewallType.WINDOWS_DEFENDER,
      rawLog: line,
    };

    if (sourcePort !== '-') {
      parsedLog.sourcePort = Number(sourcePort);
    }

    if (destinationPort !== '-') {
      parsedLog.destinationPort = Number(destinationPort);
    }

    if (direction && direction !== '-') {
      parsedLog.direction = direction;
    }

    return plainToInstance(ParsedLogDto, parsedLog);
  }
  
}
