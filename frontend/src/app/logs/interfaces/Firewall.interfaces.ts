import { FirewallType } from '../enums/FirewallType.enum';
export interface FirewallLog {
  id: number;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  action: 'ALLOW' | 'DROP';
  protocol: 'TCP' | 'UDP' | 'ICMP';
  sourcePort: number;
  destinationPort: number;
  firewallType: FirewallType;
  direction: 'SEND' | 'RECEIVE' | 'INBOUND' | 'OUTBOUND';
  isNew?: boolean; 
}

export interface LogFilters {
  action?: 'ALLOW' | 'DROP' | '';
  protocol?: 'TCP' | 'UDP' | 'ICMP' | '';
  sourceIp?: string;
  destinationIp?: string;
  sourcePort?: number | '';
  destinationPort?: number | '';
  firewallType?: FirewallType | '';
  direction?: 'SEND' | 'RECEIVE' | 'INBOUND' | 'OUTBOUND' | '';
  from?: string;
  to?: string;
}



export interface UploadResponse {
  message: string;
  linesProcessed: number;
  linesIgnored: number;
  warning?: string;
}
export interface LogsSearchResponse {
  data: FirewallLog[];
  total: number;
  page: number;
  limit: number;
}