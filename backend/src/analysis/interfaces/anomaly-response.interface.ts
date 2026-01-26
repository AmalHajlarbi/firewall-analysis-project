export enum AlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}
export enum AnomalyType {
  MULTIPLE_DROP = 'MULTIPLE_DROP',
  BRUTE_FORCE = 'BRUTE_FORCE',
}

export interface Anomaly {
  type: AnomalyType;
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