import PDFDocument from 'pdfkit';
import { StatisticsResponse } from 'src/analysis/interfaces/statistics-response.interface';
import { AnomalyResponse } from 'src/analysis/interfaces/anomaly-response.interface';

export function generateAnalysisPdf(
  stats: StatisticsResponse,
  anomalies: AnomalyResponse,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30 });
      const buffers: Uint8Array[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(18).text('Firewall Analysis Report', { underline: true });
      doc.moveDown();

      doc.fontSize(14).text('=== STATISTICS ===');
      doc.fontSize(12).text(`Total Logs: ${stats.total}`);
      doc.text(`Allowed Logs: ${stats.allowed}`);
      doc.text(`Dropped Logs: ${stats.dropped}`);
      doc.moveDown();

      doc.text('Logs by Protocol:');
      stats.byProtocol.forEach(p => doc.text(`  - ${p.label}: ${p.count}`));

      doc.text('\nRatio By Protocol:');
      stats.ratioByProtocol.forEach(r => 
        doc.text(`  - ${r.protocol}: ALLOW=${r.allowCount}, DROP=${r.dropCount}`)
      );

      doc.text('\nBy Direction:');
      stats.byDirection.forEach(d => doc.text(`  - ${d.label}: ${d.count}`));

      doc.text('\nBy Firewall Type:');
      stats.byFirewallType.forEach(f => doc.text(`  - ${f.label}: ${f.count}`));

      doc.text('\nBy Source Port:');
      stats.bySourcePort.forEach(p => doc.text(`  - ${p.label}: ${p.count}`));

      doc.text('\nBy Destination Port:');
      stats.byDestinationPort.forEach(p => doc.text(`  - ${p.label}: ${p.count}`));

      doc.text('\nTop Source IPs:');
      stats.topSourceIp.forEach(ip => doc.text(`  - ${ip.label}: ${ip.count}`));

      doc.text('\nTop Destination IPs:');
      stats.topDestinationIp.forEach(ip => doc.text(`  - ${ip.label}: ${ip.count}`));

      doc.addPage();
      doc.fontSize(14).text('=== ANOMALIES ===');
      anomalies.anomalies.forEach(a => {
        const id = a.ip || a.firewallType || a.time || '';
        const value = a.count ?? a.ports ?? '';
        doc.fontSize(12).text(`- ${a.type} [${id}]: Level=${a.level}, Count=${value}`);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
