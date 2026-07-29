import type { AlertRule, FlapEventType } from '../types';
import { catalogServiceByName, metricByKey } from '../data/catalog';

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

export interface AlertNotificationItem {
  rule: AlertRule;
  service: string;
  status: 'active' | 'resolved';
  raisedAt: string;
  clearedAt?: string;
  observed: string;
}

// Flattens every rule's per-service history into notification-center items —
// one card per breach instance, not per rule, since a rule can watch several
// services that each breach and clear independently.
export function alertNotificationItems(alerts: AlertRule[]): {
  active: AlertNotificationItem[];
  resolved: AlertNotificationItem[];
} {
  const items: AlertNotificationItem[] = [];
  alerts.forEach((rule) => {
    rule.history.forEach((h) => {
      items.push({
        rule,
        service: h.service,
        status: h.status,
        raisedAt: h.raisedAt,
        clearedAt: h.clearedAt,
        observed: h.observed,
      });
    });
  });

  const active = items
    .filter((i) => i.status === 'active')
    .sort((a, b) => new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime());

  const resolved = items
    .filter((i) => i.status === 'resolved')
    .sort((a, b) => new Date(b.clearedAt ?? b.raisedAt).getTime() - new Date(a.clearedAt ?? a.raisedAt).getTime())
    .slice(0, 20);

  return { active, resolved };
}

const FLAP_EVENT_LABELS: Record<FlapEventType, string> = {
  switchover: 'Switch Over',
  flap: 'Flap',
  outage: 'Outage',
};

// For Flaps, the event type (Switch Over / Flap / Outage) picked on the rule is the
// meaningful label — "Link Flaps" on its own doesn't say which of the three happened.
export function alertEventLabel(item: AlertNotificationItem): string {
  if (item.rule.metricKey === 'flaps' && item.rule.flapEventType) {
    return FLAP_EVENT_LABELS[item.rule.flapEventType];
  }
  return metricByKey(item.rule.metricKey).label;
}

export function alertMessageBody(item: AlertNotificationItem): string {
  const active = item.status === 'active';
  const metric = metricByKey(item.rule.metricKey);

  if (item.rule.metricKey === 'flaps') {
    const location = catalogServiceByName(item.service)?.location;
    const withLocation = item.rule.switchoverLocation && location ? ` at ${location}` : '';

    switch (item.rule.flapEventType) {
      case 'switchover':
        return active
          ? `Traffic on ${item.service} switched to the secondary path${withLocation}. We're monitoring it — you'll get one message when it's confirmed back on the primary path.`
          : `${item.service} has switched back to the primary path${withLocation}. No action needed.`;
      case 'outage':
        return active
          ? `Both paths are down for ${item.service}. This needs attention — notified immediately.`
          : `${item.service} is back up — both paths restored.`;
      case 'flap':
      default:
        return active
          ? `${item.service} is flapping — ${item.observed} times in ${item.rule.holdWindow}, past your alert level (${conditionText(item.rule)}). We're monitoring it — you'll get one recovery message when it clears.`
          : `${item.service} has stopped flapping. Back within your alert level.`;
    }
  }

  return active
    ? `${metric.label} is at ${item.observed}, past your alert level (${conditionText(item.rule)}). We're monitoring it — you'll get one recovery message when it clears.`
    : `${metric.label} on ${item.service} is back within your alert level. No action needed.`;
}
