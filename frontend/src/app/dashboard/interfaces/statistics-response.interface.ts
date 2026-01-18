export interface CountItem {
  label: string;
  count: number;
}

export interface ProtocolRatio {
  protocol: string;
  allowCount: number;
  dropCount: number;
}

export interface StatisticsResponse {
  total: number;
  allowed: number;
  droped: number;

  byProtocol: CountItem[];
  ratioByProtocol: ProtocolRatio[];

  byDirection: CountItem[];
  byFirewallType: CountItem[];
  bySourcePort: CountItem[];
  byDestinationPort: CountItem[];

  topSourceIp: CountItem[];
  topDestinationIp: CountItem[];
}
