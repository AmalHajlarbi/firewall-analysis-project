export interface ReportQueryParams {
  from?: string;
  to?: string;
  action?: string;
  protocol?: string;
  sourceIp?: string;
  destinationIp?: string;
  sourcePort?: number;
  destinationPort?: number;
  direction?: string;
  firewallType?: string;
  format?: 'csv' | 'pdf';
  page?: number;
  limit?: number;
}