const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes} ${ampm}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDuration(startIso: string, endIso?: string): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const totalMinutes = Math.max(0, Math.round((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return endIso ? label : `${label} ongoing`;
}

export type TimeRangeKey = '7d' | '30d' | '90d' | 'all' | 'custom';

export interface TimeRange {
  key: TimeRangeKey;
  from?: string;
  to?: string;
}

export const TIME_RANGE_LABELS: Record<TimeRangeKey, string> = {
  '7d': 'Last 7 Days',
  '30d': 'Last 1 Month',
  '90d': 'Last 3 Months',
  all: 'All Time',
  custom: 'Custom Range',
};

export function isWithinRange(iso: string, range: TimeRange): boolean {
  if (range.key === 'all') return true;
  const t = new Date(iso).getTime();
  if (range.key === 'custom') {
    const from = range.from ? new Date(range.from).getTime() : -Infinity;
    const to = range.to ? new Date(range.to).getTime() + 86400000 : Infinity;
    return t >= from && t <= to;
  }
  const days = { '7d': 7, '30d': 30, '90d': 90 }[range.key];
  const cutoff = Date.now() - days * 86400000;
  return t >= cutoff;
}
