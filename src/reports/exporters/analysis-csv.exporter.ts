// reports/exporters/analysis-csv.exporter.ts
import { Parser } from 'json2csv';
import { StatisticsResponse } from 'src/analysis/interfaces/statistics-response.interface';
import { AnomalyResponse } from 'src/analysis/interfaces/anomaly-response.interface';

export function exportAnalysisToCsv(
  stats: StatisticsResponse,
  anomalies: AnomalyResponse,
) {
  const flatStats = [
    { key: 'Total Logs', value: stats.total },
    { key: 'Allowed Logs', value: stats.allowed },
    { key: 'Dropped Logs', value: stats.droped },
  ];

  // Ajout des anomalies comme lignes
  const flatAnomalies = anomalies.anomalies.map(a => ({
    key: `${a.type} - ${a.ip || a.firewallType || a.time || ''}`,
    value: a.count || a.ports || '',
  }));

  const parser = new Parser();
  return parser.parse([...flatStats, ...flatAnomalies]);
}
