import { useEffect, useState } from 'react';
import type { AlertRule } from '../types';
import type { ToastTone } from '../hooks/useToasts';
import Icon from './Icon';
import Button from './Button';
import SeverityBadge from './Badge';
import { platformNotifications } from '../data/platformNotifications';
import { alertEventLabel, alertMessageBody, alertNotificationItems, type AlertNotificationItem } from '../utils/rules';
import { formatDateTime, formatDuration } from '../utils/dates';

interface Props {
  alerts: AlertRule[];
  onViewAlert: (rule: AlertRule) => void;
  onToast: (message: string, tone?: ToastTone) => void;
  onClose: () => void;
  readIds: Set<string>;
  onMarkRead: (ids: string[]) => void;
}

type NcTab = 'alerts' | 'notifications';
type NcFilter = 'all' | 'unread';

const tabClass = (active: boolean) =>
  `flex items-center gap-1.5 rounded-t-lg px-3 py-2.5 text-sm font-bold transition-colors duration-150 ${
    active ? 'border-b-2 border-primary-5 text-primary-5' : 'border-b-2 border-transparent text-secondary-6 hover:text-secondary-7'
  }`;

const filterClass = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs font-bold transition-colors duration-150 ${
    active ? 'bg-primary-5 text-white' : 'text-secondary-6 hover:bg-secondary-1'
  }`;

function UnreadDot() {
  return <span className="size-2 flex-none rounded-full bg-red-4" aria-label="Unread" />;
}

function CountBadge({ count, tone = 'critical' }: { count: number; tone?: 'critical' | 'neutral' }) {
  return (
    <span
      className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        tone === 'critical' ? 'bg-red-4 text-white' : 'bg-secondary-3 text-secondary-7'
      }`}
    >
      {count}
    </span>
  );
}

function AlertCard({
  item,
  unread,
  onViewAlert,
  onClose,
}: {
  item: AlertNotificationItem;
  unread: boolean;
  onViewAlert: (rule: AlertRule) => void;
  onClose: () => void;
}) {
  const active = item.status === 'active';
  const eventLabel = alertEventLabel(item);

  return (
    <div className="flex gap-3 rounded-2xl border border-secondary-2 p-4">
      <div
        className={`flex size-8 flex-none items-center justify-center rounded-full ${
          active ? (item.rule.severity === 'Critical' ? 'bg-red-2' : 'bg-blue-2') : 'bg-primary-2'
        }`}
      >
        <Icon
          name={active ? 'warning' : 'check_circle'}
          size={18}
          filled
          className={active ? (item.rule.severity === 'Critical' ? 'text-red-5' : 'text-blue-5') : 'text-primary-5'}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-secondary-7">
            {active ? `${item.rule.severity}: ${eventLabel} on ${item.service}` : `Returned to normal: ${item.service}`}
          </p>
          <div className="flex flex-none items-center gap-2">
            {active ? (
              <SeverityBadge severity={item.rule.severity} className="flex-none" />
            ) : (
              <span className="inline-flex flex-none items-center justify-center rounded-3xl border border-primary-3 bg-primary-2 px-2 py-1 text-[10px] text-primary-5">
                Cleared
              </span>
            )}
            {unread && <UnreadDot />}
          </div>
        </div>
        <p className="text-xs text-secondary-6">
          {active
            ? `Raised ${formatDateTime(item.raisedAt)} · ${formatDuration(item.raisedAt)}`
            : `Started ${formatDateTime(item.raisedAt)} · Cleared ${formatDateTime(item.clearedAt!)} · ${formatDuration(item.raisedAt, item.clearedAt)}`}
        </p>
        <p className="text-sm text-secondary-7">{alertMessageBody(item)}</p>
        <div className="flex items-center gap-4 pt-0.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewAlert(item.rule);
            }}
            className="text-xs font-bold text-primary-5 hover:underline"
          >
            View alert →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter({ alerts, onViewAlert, onToast, onClose, readIds, onMarkRead }: Props) {
  const [tab, setTab] = useState<NcTab>('alerts');
  const [filter, setFilter] = useState<NcFilter>('all');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 200);
  };

  const { active, resolved } = alertNotificationItems(alerts);
  const alertUnreadIds = [...active, ...resolved].filter((i) => !readIds.has(i.id)).map((i) => i.id);
  const notifUnreadIds = platformNotifications.filter((n) => !readIds.has(n.id)).map((n) => n.id);
  const alertUnreadCount = alertUnreadIds.length;
  const notifUnreadCount = notifUnreadIds.length;

  const visibleActive = filter === 'unread' ? active.filter((i) => !readIds.has(i.id)) : active;
  const visibleResolved = filter === 'unread' ? resolved.filter((i) => !readIds.has(i.id)) : resolved;
  const visibleNotifs = filter === 'unread' ? platformNotifications.filter((n) => !readIds.has(n.id)) : platformNotifications;

  const byDay: Record<string, typeof platformNotifications> = {};
  visibleNotifs.forEach((n) => {
    (byDay[n.day] ??= []).push(n);
  });

  const currentUnreadCount = tab === 'alerts' ? alertUnreadCount : notifUnreadCount;
  const handleMarkAllRead = () => onMarkRead(tab === 'alerts' ? alertUnreadIds : notifUnreadIds);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-end bg-black/40 transition-opacity duration-200 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex h-full w-[460px] max-w-[92vw] flex-col bg-white transition-transform duration-200 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-none items-center justify-between border-b border-secondary-2 px-5 py-5">
          <p className="font-inter text-lg font-extrabold text-secondary-7">Alerts &amp; Notifications</p>
          <Button variant="secondary" icon={<Icon name="close" size={18} />} onClick={handleClose}>
            Close
          </Button>
        </div>

        <div className="flex flex-none items-center gap-4 border-b border-secondary-2 px-5">
          <button type="button" onClick={() => setTab('alerts')} className={tabClass(tab === 'alerts')}>
            Alerts {alertUnreadCount > 0 && <CountBadge count={alertUnreadCount} />}
          </button>
          <button type="button" onClick={() => setTab('notifications')} className={tabClass(tab === 'notifications')}>
            Notifications {notifUnreadCount > 0 && <CountBadge count={notifUnreadCount} tone="neutral" />}
          </button>
        </div>

        <div className="flex flex-none items-center justify-between border-b border-secondary-2 px-5 py-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setFilter('all')} className={filterClass(filter === 'all')}>
              All
            </button>
            <button type="button" onClick={() => setFilter('unread')} className={filterClass(filter === 'unread')}>
              Unread{currentUnreadCount > 0 ? ` (${currentUnreadCount})` : ''}
            </button>
          </div>
          {currentUnreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-primary-5 hover:underline"
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'alerts' ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2 rounded-xl border border-primary-3 bg-primary-2/40 px-3 py-2.5 text-xs text-secondary-7">
                <Icon name="notifications" size={16} className="mt-0.5 flex-none text-primary-5" />
                <p>
                  <span className="font-bold">Network alerts</span> — conditions on your live services. These only
                  notify; they don't raise tickets and aren't tied to your SLA.
                </p>
              </div>

              {active.length === 0 && resolved.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <Icon name="check_circle" size={32} filled className="text-primary-5" />
                  <p className="text-sm font-bold text-secondary-7">No alerts</p>
                  <p className="max-w-[280px] text-xs text-secondary-6">
                    Everything is running within your alert levels. Network alerts appear here when a rule is
                    triggered.
                  </p>
                </div>
              ) : visibleActive.length === 0 && visibleResolved.length === 0 ? (
                <p className="py-16 text-center text-sm text-secondary-6">No unread alerts. You're all caught up.</p>
              ) : (
                <>
                  {visibleActive.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-secondary-6">Active now</p>
                      <div className="flex flex-col gap-2">
                        {visibleActive.map((item) => (
                          <AlertCard
                            key={item.id}
                            item={item}
                            unread={!readIds.has(item.id)}
                            onViewAlert={onViewAlert}
                            onClose={handleClose}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {visibleResolved.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-secondary-6">
                        Recently returned to normal
                      </p>
                      <div className="flex flex-col gap-2">
                        {visibleResolved.map((item) => (
                          <AlertCard
                            key={item.id}
                            item={item}
                            unread={!readIds.has(item.id)}
                            onViewAlert={onViewAlert}
                            onClose={handleClose}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2 rounded-xl border border-secondary-2 bg-secondary-1 px-3 py-2.5 text-xs text-secondary-7">
                <Icon name="description" size={16} className="mt-0.5 flex-none text-secondary-6" />
                <p>
                  <span className="font-bold">Platform notifications</span> — orders, billing, and maintenance
                  updates for your account.
                </p>
              </div>

              {platformNotifications.length === 0 ? (
                <p className="py-16 text-center text-sm text-secondary-6">No notifications.</p>
              ) : Object.keys(byDay).length === 0 ? (
                <p className="py-16 text-center text-sm text-secondary-6">
                  No unread notifications. You're all caught up.
                </p>
              ) : (
                Object.keys(byDay).map((day) => (
                <div key={day} className="flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary-6">{day}</p>
                  <div className="flex flex-col gap-2">
                    {byDay[day].map((n) => (
                      <div key={n.id} className="flex gap-3 rounded-2xl border border-secondary-2 p-4">
                        <div
                          className={`flex size-8 flex-none items-center justify-center rounded-full ${
                            n.kind === 'warning' ? 'bg-orange-2' : 'bg-blue-2'
                          }`}
                        >
                          <Icon name={n.icon} size={18} className={n.kind === 'warning' ? 'text-orange-5' : 'text-blue-5'} />
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold text-secondary-7">{n.title}</p>
                            <div className="flex flex-none items-center gap-2">
                              <span
                                className={`inline-flex flex-none items-center justify-center rounded-3xl border px-2 py-1 text-[10px] ${
                                  n.kind === 'warning' ? 'border-orange-3 bg-orange-2 text-orange-5' : 'border-blue-3 bg-blue-2 text-blue-5'
                                }`}
                              >
                                {n.kind === 'warning' ? 'Warning' : 'Info'}
                              </span>
                              {!readIds.has(n.id) && <UnreadDot />}
                            </div>
                          </div>
                          <p className="text-xs text-secondary-6">{n.time}</p>
                          <p className="text-sm text-secondary-7">
                            {n.body}
                            {n.service && (
                              <>
                                <br />
                                <span className="text-secondary-6">
                                  Affected service: <span className="font-bold text-secondary-7">{n.service}</span>
                                </span>
                              </>
                            )}
                          </p>
                          <div className="flex items-center gap-4 pt-0.5">
                            {n.actions.map((a) => (
                              <button
                                key={a}
                                type="button"
                                onClick={() => onToast(`${a} (coming soon)`, 'info')}
                                className="text-xs font-bold text-primary-5 hover:underline"
                              >
                                {a} →
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
