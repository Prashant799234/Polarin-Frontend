import type { AlertRule } from '../types';
import { metricByKey } from '../data/catalog';

export function ruleStatus(rule: AlertRule): 'active' | 'normal' {
  return rule.history.some((h) => h.status === 'active') ? 'active' : 'normal';
}

export function activeCountFor(rule: AlertRule): number {
  return rule.history.filter((h) => h.status === 'active').length;
}

export function conditionText(rule: AlertRule): string {
  const metric = metricByKey(rule.metricKey);
  return `${rule.aggregation} ${metric.label} ${rule.comparator} ${rule.threshold}${metric.unit}`;
}

export function latestTimestamp(rule: AlertRule): string {
  if (rule.history.length === 0) return rule.createdAt;
  return rule.history.reduce(
    (latest, h) => (new Date(h.raisedAt) > new Date(latest) ? h.raisedAt : latest),
    rule.history[0].raisedAt,
  );
}

export function activeEntryForService(rule: AlertRule, serviceName: string) {
  return rule.history.find((h) => h.service === serviceName && h.status === 'active') ?? null;
}

export function entriesForService(rule: AlertRule, serviceName: string) {
  return rule.history
    .filter((h) => h.service === serviceName)
    .sort((a, b) => new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime());
}
