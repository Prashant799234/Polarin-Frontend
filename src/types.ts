export type Severity = 'Critical' | 'Info';
export type AlertStatus = 'active' | 'normal';

export interface AlertService {
  id: string;
  name: string;
  activeAlerts: number;
  capacity: string;
}

export interface AlertRule {
  id: string;
  ruleName: string;
  severity: Severity;
  status: AlertStatus;
  services: AlertService[];
  aggregation: string;
  metric: string;
  comparator: string;
  threshold: string;
  eventType: string;
  activeAlertCount: number;
  timestamp: string;
}
