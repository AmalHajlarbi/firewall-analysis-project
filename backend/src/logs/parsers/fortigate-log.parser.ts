import { FirewallLogParser } from './firewall-log.parser';
import { FirewallType } from '../enums/firewall-type.enum';
import { ParsedLogDto } from '../dto/parsed-log.dto';
import { plainToInstance } from 'class-transformer';

export class FortiGateLogParser implements FirewallLogParser {
  readonly firewallType = FirewallType.FORTIGATE;

  canParse(line: string): boolean {
    // Détection pour FortiGate
    return line.includes('date=') && 
           line.includes('time=') && 
           (line.includes('devname=') || line.includes('type=') || line.includes('subtype='));
  }

  parse(line: string): ParsedLogDto | null {
    try {
      // On extrait les paires clé=valeur
      const fields: Record<string, string> = {};
      const pairs = line.match(/(\w+)=("[^"]*"|[^ ]*)/g) || [];

      for (const pair of pairs) {
        const [key, value] = pair.split('=', 2);
        if (key && value) {
          // Enlever les guillemets si présents
          fields[key] = value.replace(/^"|"$/g, '');
        }
      }

      // Champs obligatoires
      if (!fields.date || !fields.time || !fields.action) {
        return null;
      }

      const timestampStr = `${fields.date} ${fields.time}`;
      const timestamp = new Date(timestampStr);

      if (isNaN(timestamp.getTime())) {
        return null;
      }

      // Champs principaux
      const action = fields.action || 'unknown';
      const protocol = fields.proto || fields.service || 'unknown';

      // IP source / destination
      const sourceIp = fields.srcip || fields.src || '0.0.0.0';
      const destinationIp = fields.dstip || fields.dst || '0.0.0.0';

      // Ports 
      let sourcePort: number | undefined = undefined;
      let destinationPort: number | undefined = undefined;

      if (fields.srcport) sourcePort = parseInt(fields.srcport, 10);
      if (fields.dstport) destinationPort = parseInt(fields.dstport, 10);

      // Direction 
      let direction: string | undefined;
      if (fields.direction) {
        direction = fields.direction;
      } else if (fields.subtype === 'forward') {
        direction = 'outbound';
      } else if (fields.action === 'blocked') {
        direction = 'inbound'; 
      }

      const parsedLog: Partial<ParsedLogDto> = {
        timestamp,
        action,
        protocol,
        sourceIp,
        destinationIp,
        sourcePort,
        destinationPort,
        direction,
        firewallType: FirewallType.FORTIGATE,
        rawLog: line.trim(),
      };

      // Nettoyage des champs optionnels non valides
      if (isNaN(parsedLog.sourcePort!)) delete parsedLog.sourcePort;
      if (isNaN(parsedLog.destinationPort!)) delete parsedLog.destinationPort;

      return plainToInstance(ParsedLogDto, parsedLog);
    } catch (e) {
      console.error('Erreur parsing FortiGate:', e);
      return null;
    }
  }
}