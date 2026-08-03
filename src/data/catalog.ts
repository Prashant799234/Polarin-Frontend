import type { CatalogService, MetricDef } from '../types';

// Metric catalog — harvested from the reference product's alerting data model
// (direction, unit, default threshold, applicable product families) and
// mapped onto our two verified severity colors (Critical / Info).
export const metricCatalog: MetricDef[] = [
  {
    key: 'availability',
    label: 'Availability',
    description: 'Service uptime against your alert level.',
    unit: '%',
    direction: 'drops below',
    comparator: '<',
    defaultThreshold: '99.9',
    defaultAggregation: 'AVG',
    severity: 'Critical',
    products: ['VC', 'Wave'],
  },
  {
    key: 'latency',
    label: 'Latency',
    description: 'Round-trip delay on the path.',
    unit: 'ms',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '25',
    defaultAggregation: 'AVG',
    severity: 'Info',
    products: ['VC', 'Wave'],
  },
  {
    key: 'traffic_in',
    label: 'Traffic In',
    familyKey: 'traffic',
    familyLabel: 'Traffic',
    variantLabel: 'In',
    description: 'Inbound bandwidth in use.',
    unit: '%',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '80',
    defaultAggregation: 'MAX',
    severity: 'Info',
    products: ['Port', 'VC'],
  },
  {
    key: 'traffic_out',
    label: 'Traffic Out',
    familyKey: 'traffic',
    familyLabel: 'Traffic',
    variantLabel: 'Out',
    description: 'Outbound bandwidth in use.',
    unit: '%',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '80',
    defaultAggregation: 'MAX',
    severity: 'Info',
    products: ['Port', 'VC'],
  },
  {
    key: 'packets_in',
    label: 'Packets In',
    familyKey: 'packets',
    familyLabel: 'Packets',
    variantLabel: 'In',
    description: 'Inbound frames per second.',
    unit: 'pps',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '500000',
    defaultAggregation: 'MAX',
    severity: 'Info',
    products: ['Port', 'VC'],
  },
  {
    key: 'packets_out',
    label: 'Packets Out',
    familyKey: 'packets',
    familyLabel: 'Packets',
    variantLabel: 'Out',
    description: 'Outbound frames per second.',
    unit: 'pps',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '500000',
    defaultAggregation: 'MAX',
    severity: 'Info',
    products: ['Port', 'VC'],
  },
  {
    key: 'errors',
    label: 'Errors',
    description: 'Corrupted or dropped frames on the interface.',
    unit: '',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '100',
    defaultAggregation: 'SUM',
    severity: 'Info',
    products: ['Port', 'VC', 'Wave'],
  },
  {
    key: 'power_tx',
    label: 'Power Transmitted',
    familyKey: 'power',
    familyLabel: 'Power',
    variantLabel: 'Transmitted',
    description: 'Outbound light level on the fibre.',
    unit: 'dBm',
    direction: 'drops below',
    comparator: '<',
    defaultThreshold: '-3',
    defaultAggregation: 'MIN',
    severity: 'Critical',
    products: ['Port'],
  },
  {
    key: 'power_rx',
    label: 'Power Received',
    familyKey: 'power',
    familyLabel: 'Power',
    variantLabel: 'Received',
    description: 'Inbound light level on the fibre.',
    unit: 'dBm',
    direction: 'drops below',
    comparator: '<',
    defaultThreshold: '-14',
    defaultAggregation: 'MIN',
    severity: 'Critical',
    products: ['Port'],
  },
  {
    key: 'power_levels',
    label: 'Power Levels',
    familyKey: 'power',
    familyLabel: 'Power',
    variantLabel: 'Levels',
    description: 'Optical power level on the wavelength.',
    unit: 'dBm',
    direction: 'drops below',
    comparator: '<',
    defaultThreshold: '-7',
    defaultAggregation: 'MIN',
    severity: 'Critical',
    products: ['Wave'],
  },
  {
    key: 'packet_loss',
    label: 'Packet Loss',
    description: 'Share of packets that never arrive.',
    unit: '%',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '1',
    defaultAggregation: 'AVG',
    severity: 'Critical',
    products: ['VC'],
  },
  {
    key: 'jitter',
    label: 'Jitter',
    description: 'Delay variation between packets.',
    unit: 'ms',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '5',
    defaultAggregation: 'AVG',
    severity: 'Info',
    products: ['VC'],
  },
  {
    key: 'alarms',
    label: 'Alarms',
    description: 'Major and critical alarms raised on the protected path.',
    unit: '',
    direction: 'reaches',
    comparator: '=',
    defaultThreshold: '1',
    defaultAggregation: 'COUNT',
    severity: 'Critical',
    products: ['Wave'],
  },
  {
    key: 'flaps',
    label: 'Link Flaps',
    description: 'Repeated switch-over or instability on a protected path.',
    unit: '',
    direction: 'rises above',
    comparator: '>',
    defaultThreshold: '10',
    defaultAggregation: 'COUNT',
    severity: 'Critical',
    products: ['Wave'],
  },
];

export const metricByKey = (key: string) => metricCatalog.find((m) => m.key === key)!;

export interface MetricFamily {
  key: string;
  label: string;
  variantLabel?: string;
  members: MetricDef[];
}

// Groups metrics that share a familyKey (Traffic In/Out, Packets In/Out, Power
// Transmitted/Received/Levels) so the form can show one Metric dropdown plus a
// second dropdown for the specific variant, instead of listing each separately.
export const metricFamilies: MetricFamily[] = (() => {
  const order: string[] = [];
  const groups = new Map<string, MetricDef[]>();
  metricCatalog.forEach((m) => {
    const famKey = m.familyKey ?? m.key;
    if (!groups.has(famKey)) {
      groups.set(famKey, []);
      order.push(famKey);
    }
    groups.get(famKey)!.push(m);
  });
  return order.map((key) => {
    const members = groups.get(key)!;
    return { key, label: members[0].familyLabel ?? members[0].label, members };
  });
})();

export const familyForMetric = (metricKey: string): MetricFamily =>
  metricFamilies.find((f) => f.members.some((m) => m.key === metricKey))!;

export const familyProducts = (family: MetricFamily): string[] =>
  [...new Set(family.members.flatMap((m) => m.products))];

export const HOLD_WINDOWS = ['15 min', '30 min', '45 min', '60 min'];

export const serviceCatalog: CatalogService[] = [
  { name: 'VC-Bangalore-01', family: 'VC', capacity: '10 Gbps', location: 'Bangalore' },
  { name: 'VC-Bangalore-02', family: 'VC', capacity: '10 Gbps', location: 'Bangalore' },
  { name: 'VC-Mumbai-01', family: 'VC', capacity: '10 Gbps', location: 'Mumbai' },
  { name: 'VC-Mumbai-02', family: 'VC', capacity: '40 Gbps', location: 'Mumbai' },
  { name: 'VC-Chennai-01', family: 'VC', capacity: '10 Gbps', location: 'Chennai' },
  { name: 'VC-Delhi-01', family: 'VC', capacity: '10 Gbps', location: 'Delhi' },
  { name: 'VC-Singapore-01', family: 'VC', capacity: '100 Gbps', location: 'Singapore' },
  {
    name: 'Wave-BLR-MUM',
    family: 'Wave',
    capacity: '100 Gbps',
    location: 'Bangalore ↔ Mumbai',
    secondaryPath: 'Bangalore ↔ Chennai ↔ Mumbai (protection route)',
  },
  {
    name: 'Wave-DEL-HYD',
    family: 'Wave',
    capacity: '400 Gbps',
    location: 'Delhi ↔ Hyderabad',
    secondaryPath: 'Delhi ↔ Bangalore ↔ Hyderabad (protection route)',
  },
  {
    name: 'Wave-CHN-SIN',
    family: 'Wave',
    capacity: '10 Gbps',
    location: 'Chennai ↔ Singapore',
    secondaryPath: 'Chennai ↔ Mumbai ↔ Singapore (protection route)',
  },
  { name: 'Port-MUM-MB1-A', family: 'Port', capacity: '10 Gbps', location: 'Mumbai · MB1-A' },
  { name: 'Port-PUN-03', family: 'Port', capacity: '1 Gbps', location: 'Pune' },
];

export const catalogServiceByName = (name: string) => serviceCatalog.find((s) => s.name === name);

export const PRODUCT_FAMILIES: { key: 'all' | 'VC' | 'Wave' | 'Port'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'VC', label: 'Virtual Connection' },
  { key: 'Wave', label: 'DCI Wave' },
  { key: 'Port', label: 'Port' },
];

export const NOTIFY_CHANNELS: { key: 'In-app' | 'Email'; label: string; detail: string }[] = [
  {
    key: 'In-app',
    label: 'In-app',
    detail:
      'Shows up inside Polarin the moment the alert fires — on your Dashboard, on the affected Service page, and in the notification bell at the top of the screen.',
  },
  {
    key: 'Email',
    label: 'Email',
    detail:
      'Sent as a standalone email straight to each recipient\'s inbox at the address you add below — with the rule name, severity, and what\'s currently breaching. No Polarin login is needed to receive it.',
  },
];

export interface SlaTierDef {
  key: 'expected' | 'standard' | 'custom';
  label: string;
  value: string;
  note: string;
}

export const SLA_TIERS: SlaTierDef[] = [
  { key: 'expected', label: 'Expected SLA', value: '99.9', note: 'The premium uptime target plotted on your Availability graph.' },
  { key: 'standard', label: 'Standard SLA', value: '99.7', note: 'The contracted baseline commitment.' },
  { key: 'custom', label: 'Custom target', value: '', note: 'Set your own threshold if it differs from the SLA bands.' },
];

// Placeholder directory for the recipient picker — generic example data, not tied to any real org.
export interface DirectoryUser {
  name: string;
  email: string;
  role: string;
  isSelf?: boolean;
}

// The signed-in user shown in the header — kept in the directory so they can be
// found like anyone else, and so new alert rules can pre-fill them as a recipient.
export const CURRENT_USER: DirectoryUser = {
  name: 'Abram Qureshi',
  email: 'abram.qureshi@example.com',
  role: 'Admin',
  isSelf: true,
};

export const userDirectory: DirectoryUser[] = [
  CURRENT_USER,
  { name: 'Alex Morgan', email: 'alex.morgan@example.com', role: 'System Admin' },
  { name: 'Jordan Lee', email: 'jordan.lee@example.com', role: 'Network Admin' },
  { name: 'Ops Desk', email: 'ops-desk@example.com', role: 'Network Admin' },
  { name: 'NOC Team', email: 'noc-team@example.com', role: 'Network Viewer' },
  { name: 'Sam Patel', email: 'sam.patel@example.com', role: 'Finance Viewer' },
];

export const directoryUserByEmail = (email: string) => userDirectory.find((u) => u.email === email);
