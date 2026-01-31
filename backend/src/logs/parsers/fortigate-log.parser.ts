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
    
      const fields: Record<string, string> = {};
      const pairs = line.match(/(\w+)=("[^"]*"|[^ ]*)/g) || [];

      for (const pair of pairs) {
        const [key, value] = pair.split('=', 2);
        if (key && value) {
    
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
      let rawAction = fields.action.toLowerCase(); 
      let action: string;

      if (rawAction === 'accept') action = 'ALLOW';
      else if (rawAction === 'blocked' || rawAction === 'deny' || rawAction === 'denied') action = 'DROP';
      else action = rawAction.toUpperCase();


      const protocol = fields.proto || fields.service || 'unknown';

      // IP source / destination
      const sourceIp = fields.srcip || fields.src || '0.0.0.0';
      const destinationIp = fields.dstip || fields.dst || '0.0.0.0';

      // Ports 
      let sourcePort: number | undefined;
      let destinationPort: number | undefined;

      const srcPortRaw = fields.srcport || fields.sport || fields.src_port;
      const dstPortRaw = fields.dstport || fields.dport || fields.dst_port;

      if (srcPortRaw && !isNaN(Number(srcPortRaw))) {
        sourcePort = parseInt(srcPortRaw, 10);
      } else {
        sourcePort = undefined; 
      }

      if (dstPortRaw && !isNaN(Number(dstPortRaw))) {
        destinationPort = parseInt(dstPortRaw, 10);
      } else {
        destinationPort = undefined; 
      }

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

      
      if (isNaN(parsedLog.sourcePort!)) delete parsedLog.sourcePort;
      if (isNaN(parsedLog.destinationPort!)) delete parsedLog.destinationPort;

      return plainToInstance(ParsedLogDto, parsedLog);
    } catch (e) {
      console.error('Erreur parsing FortiGate:', e);
      return null;
    }
  }
}