import PDFDocument from 'pdfkit';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';

export function generatePdf(logs: FirewallLogEntity[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 20, size: 'A4' });
      const buffers: Uint8Array[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(16).text('Firewall Logs Report', { underline: true });
      doc.moveDown();

      doc.fontSize(11).text(
        'Timestamp                  Action    Protocol    Source IP           Src Port     Destination IP       Dest Port     FW Type'
      );
      doc.moveDown(0.5);

      logs.forEach(log => {
        const ts = new Date(log.timestamp).toLocaleString(); // date lisible
        const line = `${ts.padEnd(24)} ${log.action.padEnd(8)} ${log.protocol.padEnd(8)} ${log.sourceIp.padEnd(10)} ${String(log.sourcePort).padEnd(10)} ${log.destinationIp.padEnd(10)} ${String(log.destinationPort).padEnd(10)}${log.firewallType.padEnd(8)}`;
        doc.text(line);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}