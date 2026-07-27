export type Severity = 'Critical' | 'Info';
export type ProductFamily = 'VC' | 'Wave' | 'Port';
export type Direction = 'drops below' | 'rises above' | 'reaches';

export interface MetricDef {
  key: string;
  label: string;
  description: string;
  unit: string;
  direction: Direction;
  comparator: '<' | '>' | '=';
  defaultThreshold: string;
  severity: Severity;
  products: ProductFamily[];
}

export interface CatalogService {
  name: string;
  family: ProductFamily;
  capacity: string;
}

export interface AlertService {
  id: string;
  name: string;
  family: ProductFamily;
  capacity: string;
}

export interface HistoryEntry {
  id: string;
  service: string;
  status: 'active' | 'resolved';
  observed: string;
  raisedAt: string;
  clearedAt?: string;
}

export interface AlertRule {
  id: string;
  ruleName: string;
  metricKey: string;
  severity: Severity;
  aggregation: string;
  comparator: string;
  threshold: string;
  holdWindow: string;
  services: AlertService[];
  history: HistoryEntry[];
  createdAt: string;
}
