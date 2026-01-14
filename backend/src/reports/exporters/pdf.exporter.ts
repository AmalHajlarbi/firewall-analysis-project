import PDFDocument from 'pdfkit';
import { FirewallLogEntity } from 'src/logs/entities/firewall-log.entity';

export function generatePdf(logs: FirewallLogEntity[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers: Uint8Array[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      logs.forEach(log => {
        const line = `${log.timestamp} ${log.action} ${log.protocol} ${log.sourceIp} -> ${log.destinationIp}`;
        doc.text(line);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


/*import { Log } from '../../logs/entities/log.entity';
import PDFDocument from 'pdfkit';
import streamBuffers from 'stream-buffers';

export function exportToPdf(logs: Log[]) {
  const doc = new PDFDocument();
  const bufferStream = new streamBuffers.WritableStreamBuffer();

  doc.pipe(bufferStream);

  doc.fontSize(14).text('Firewall Logs Report', { align: 'center' });
  logs.forEach((log) => {
    doc.text(JSON.stringify(log));
  });

  doc.end();

  return bufferStream.getContents();
}*/
