import type { AlertRule, HistoryEntry, Recipient } from '../types';
import { catalogServiceByName, userDirectory } from './catalog';

function svc(name: string) {
  const c = catalogServiceByName(name)!;
  return { id: `svc-${c.name}`, name: c.name, family: c.family, capacity: c.capacity };
}

let historyCounter = 0;
function h(entry: Omit<HistoryEntry, 'id'>): HistoryEntry {
  historyCounter += 1;
  return { id: `h-${historyCounter}`, ...entry };
}

function rec(email: string): Recipient {
  const u = userDirectory.find((x) => x.email === email)!;
  return { name: u.name, email: u.email };
}

export const initialAlerts: AlertRule[] = [
  {
    id: 'ar-001',
    ruleName: 'Production Availability Drop',
    metricKey: 'availability',
    severity: 'Critical',
    aggregation: 'AVG',
    comparator: '<',
    threshold: '99.9',
    holdWindow: '15 min',
    slaTier: 'expected',
    services: [svc('VC-Bangalore-01'), svc('VC-Bangalore-02'), svc('VC-Chennai-01')],
    history: [
      h({ service: 'VC-Bangalore-01', status: 'active', observed: '99.4%', raisedAt: '2026-07-27T09:10:00' }),
      h({
        service: 'VC-Bangalore-02',
        status: 'resolved',
        observed: '99.6%',
        raisedAt: '2026-07-25T14:00:00',
        clearedAt: '2026-07-25T14:43:00',
      }),
      h({
        service: 'VC-Chennai-01',
        status: 'resolved',
        observed: '99.5%',
        raisedAt: '2026-07-20T10:00:00',
        clearedAt: '2026-07-20T10:55:00',
      }),
    ],
    createdAt: '2026-05-02T10:00:00',
    channels: ['In-app', 'Email'],
    recipients: [rec('alex.morgan@example.com'), rec('ops-desk@example.com')],
  },
  {
    id: 'ar-002',
    ruleName: 'Core Utilization Warning',
    metricKey: 'traffic',
    severity: 'Info',
    aggregation: 'MAX',
    comparator: '>',
    threshold: '85',
    holdWindow: '30 min',
    services: [svc('VC-Mumbai-02'), svc('VC-Mumbai-01')],
    history: [
      h({ service: 'VC-Mumbai-02', status: 'active', observed: '91%', raisedAt: '2026-07-27T04:05:00' }),
      h({
        service: 'VC-Mumbai-01',
        status: 'resolved',
        observed: '88%',
        raisedAt: '2026-07-22T09:00:00',
        clearedAt: '2026-07-22T09:47:00',
      }),
    ],
    createdAt: '2026-04-11T10:00:00',
    channels: ['In-app'],
    recipients: [],
  },
  {
    id: 'ar-003',
    ruleName: 'Latency Spike Detected',
    metricKey: 'latency',
    severity: 'Info',
    aggregation: 'MAX',
    comparator: '>',
    threshold: '40',
    holdWindow: '15 min',
    services: [svc('VC-Chennai-01')],
    history: [
      h({
        service: 'VC-Chennai-01',
        status: 'resolved',
        observed: '47 ms',
        raisedAt: '2026-07-22T09:14:00',
        clearedAt: '2026-07-22T09:41:00',
      }),
    ],
    createdAt: '2026-03-30T10:00:00',
    channels: ['In-app', 'Email'],
    recipients: [rec('jordan.lee@example.com')],
  },
  {
    id: 'ar-004',
    ruleName: 'Jitter Threshold Breach',
    metricKey: 'jitter',
    severity: 'Info',
    aggregation: 'AVG',
    comparator: '>',
    threshold: '8',
    holdWindow: '15 min',
    services: [svc('VC-Delhi-01'), svc('VC-Singapore-01')],
    history: [
      h({
        service: 'VC-Delhi-01',
        status: 'resolved',
        observed: '9.6 ms',
        raisedAt: '2026-07-21T14:37:00',
        clearedAt: '2026-07-21T15:02:00',
      }),
    ],
    createdAt: '2026-03-14T10:00:00',
    channels: ['In-app'],
    recipients: [],
  },
  {
    id: 'ar-005',
    ruleName: 'Fibre Power Drop',
    metricKey: 'power_levels',
    severity: 'Critical',
    aggregation: 'MIN',
    comparator: '<',
    threshold: '-9',
    holdWindow: '15 min',
    services: [svc('Wave-DEL-HYD')],
    history: [
      h({
        service: 'Wave-DEL-HYD',
        status: 'resolved',
        observed: '-9.8 dBm',
        raisedAt: '2026-07-19T08:52:00',
        clearedAt: '2026-07-19T09:30:00',
      }),
    ],
    createdAt: '2026-02-27T10:00:00',
    channels: ['In-app', 'Email'],
    recipients: [rec('alex.morgan@example.com'), rec('sam.patel@example.com')],
  },
  {
    id: 'ar-006',
    ruleName: 'Interface Errors Rising',
    metricKey: 'errors',
    severity: 'Info',
    aggregation: 'SUM',
    comparator: '>',
    threshold: '250',
    holdWindow: '30 min',
    services: [svc('Port-PUN-03')],
    history: [
      h({
        service: 'Port-PUN-03',
        status: 'resolved',
        observed: '312',
        raisedAt: '2026-07-18T18:20:00',
        clearedAt: '2026-07-18T19:05:00',
      }),
    ],
    createdAt: '2026-02-10T10:00:00',
    channels: ['In-app'],
    recipients: [],
  },
  {
    id: 'ar-007',
    ruleName: 'Packet Loss Recovery Watch',
    metricKey: 'packet_loss',
    severity: 'Critical',
    aggregation: 'MAX',
    comparator: '>',
    threshold: '2',
    holdWindow: '15 min',
    services: [svc('VC-Bangalore-02'), svc('Wave-BLR-MUM'), svc('Wave-CHN-SIN')],
    history: [
      h({
        service: 'VC-Bangalore-02',
        status: 'resolved',
        observed: '2.4%',
        raisedAt: '2026-07-15T10:11:00',
        clearedAt: '2026-07-15T10:36:00',
      }),
      h({
        service: 'Wave-BLR-MUM',
        status: 'resolved',
        observed: '3.1%',
        raisedAt: '2026-07-12T13:48:00',
        clearedAt: '2026-07-12T14:20:00',
      }),
    ],
    createdAt: '2026-01-22T10:00:00',
    channels: ['In-app', 'Email'],
    recipients: [rec('ops-desk@example.com'), rec('noc-team@example.com')],
  },
  {
    id: 'ar-008',
    ruleName: 'Device Alarm Raised',
    metricKey: 'alarms',
    severity: 'Critical',
    aggregation: 'COUNT',
    comparator: '=',
    threshold: '1',
    holdWindow: '15 min',
    services: [svc('Wave-CHN-SIN')],
    history: [
      h({
        service: 'Wave-CHN-SIN',
        status: 'resolved',
        observed: '1',
        raisedAt: '2026-07-09T07:03:00',
        clearedAt: '2026-07-09T07:20:00',
      }),
    ],
    createdAt: '2026-01-05T10:00:00',
    channels: ['In-app', 'Email'],
    recipients: [rec('noc-team@example.com')],
  },
  {
    id: 'ar-009',
    ruleName: 'Link Flap Storm',
    metricKey: 'flaps',
    severity: 'Critical',
    aggregation: 'COUNT',
    comparator: '>',
    threshold: '12',
    holdWindow: '30 min',
    flapEventType: 'flap',
    services: [svc('Wave-BLR-MUM')],
    history: [
      h({
        service: 'Wave-BLR-MUM',
        status: 'resolved',
        observed: '15',
        raisedAt: '2026-07-03T15:29:00',
        clearedAt: '2026-07-03T16:02:00',
      }),
    ],
    createdAt: '2025-12-18T10:00:00',
    channels: ['In-app', 'Email'],
    recipients: [rec('ops-desk@example.com')],
  },
  {
    id: 'ar-010',
    ruleName: 'Port Bandwidth Saturation',
    metricKey: 'traffic',
    severity: 'Info',
    aggregation: 'MAX',
    comparator: '>',
    threshold: '90',
    holdWindow: '15 min',
    services: [svc('Port-MUM-MB1-A')],
    history: [
      h({
        service: 'Port-MUM-MB1-A',
        status: 'resolved',
        observed: '94%',
        raisedAt: '2026-06-28T11:00:00',
        clearedAt: '2026-06-28T11:50:00',
      }),
    ],
    createdAt: '2025-11-30T10:00:00',
    channels: ['In-app'],
    recipients: [],
  },
];
