export enum AlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Anomaly {
  type: string;
  level: AlertLevel;
  ip?: string;
  count?: number;
  ports?: number;
}

export interface AnomalyResponse {
  anomalies: Anomaly[];
}
