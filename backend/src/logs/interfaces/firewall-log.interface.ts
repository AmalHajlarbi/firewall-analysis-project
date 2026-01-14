import { FirewallType } from '../enums/firewall-type.enum';

export interface FirewallLog {
  timestamp: Date;
  action: string;
  protocol: string;
  sourceIp: string;
  sourcePort?: number;
  destinationIp: string;
  destinationPort?: number;
  direction?: string;
  firewallType: FirewallType;
  rawLog: string;
}
