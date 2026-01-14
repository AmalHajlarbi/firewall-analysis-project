export enum AlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Anomaly {
  type: string;
  level: AlertLevel;
  count?: number;
  ip?: string;
  protocol?: string;
  firewallType?: string;
  time?: string;
  ports?: number;
}

export interface AnomalyResponse {
  anomalies: Anomaly[];
}
