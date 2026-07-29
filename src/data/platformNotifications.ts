export interface PlatformNotification {
  id: string;
  icon: string;
  kind: 'info' | 'warning';
  title: string;
  time: string;
  day: string;
  body: string;
  service?: string;
  actions: string[];
}

// Account-level notifications (maintenance, orders, billing) — separate from
// the rule-based network alerts, and not tied to any live customer data.
export const platformNotifications: PlatformNotification[] = [
  {
    id: 'pn-1',
    icon: 'build',
    kind: 'info',
    title: 'Planned maintenance',
    time: '42m ago',
    day: 'Today',
    body: 'Scheduled fibre maintenance in the Singapore region on 5 Feb, 02:00–04:00 UTC. Minimal impact expected.',
    service: 'VC-Singapore-01',
    actions: ['View service'],
  },
  {
    id: 'pn-2',
    icon: 'description',
    kind: 'info',
    title: 'Order saved in Design State',
    time: '2h ago',
    day: 'Today',
    body: '"Eight testing port" is saved in Design State. Please review and place the order.',
    actions: ['Review order'],
  },
  {
    id: 'pn-3',
    icon: 'credit_card',
    kind: 'warning',
    title: 'Subscription expiring soon',
    time: 'Yesterday',
    day: 'Yesterday',
    body: 'Your subscription for Delhi → Hyderabad expires in 7 days. Renew now to maintain uninterrupted service.',
    service: 'Wave-DEL-HYD',
    actions: ['Renew subscription', 'View service'],
  },
];
