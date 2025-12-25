import { Log } from '../../logs/entities/log.entity';
import { Parser } from 'json2csv';

export function exportToCsv(logs: Log[]) {
  const parser = new Parser();
  const csv = parser.parse(logs);
  return { filename: 'logs.csv', content: csv };
}
