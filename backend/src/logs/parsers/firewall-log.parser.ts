import { ParsedLogDto } from '../dto/parsed-log.dto';
import { FirewallType } from '../enums/firewall-type.enum';


export interface FirewallLogParser {
  readonly firewallType: FirewallType;

  canParse(line: string): boolean;

  parse(line: string): ParsedLogDto | null;
}
