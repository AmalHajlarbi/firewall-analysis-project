import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';
import { Parser } from 'json2csv';

export function exportToCsv(logs: FirewallLogEntity[]) {
  const parser = new Parser();
  const csv = parser.parse(logs);
  return { filename: 'logs.csv', content: csv };
}
