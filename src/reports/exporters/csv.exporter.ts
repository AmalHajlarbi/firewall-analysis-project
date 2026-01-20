import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';

import { Parser } from 'json2csv';

export function exportToCsv(logs: FirewallLogEntity[]) {
    const cleanLogs = logs.map(log => ({
      timestamp: log.timestamp,
      action: log.action,
      protocol: log.protocol,
      sourceIp: log.sourceIp,
      sourcePort: log.sourcePort,
      destinationIp: log.destinationIp,
      destinationPort: log.destinationPort,
      firewallType: log.firewallType,
  }));
  const parser = new Parser();
  const csv = parser.parse(cleanLogs);
  return { filename: 'logs.csv', content: csv };
}
