import { useEffect, useState } from 'react';
import type { AlertRule, AlertService } from '../types';
import SeverityBadge from './Badge';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import Icon from './Icon';
import Tooltip from './Tooltip';
import { serviceCatalog } from '../data/catalog';
import { activeEntryForService, conditionText, entriesForService } from '../utils/rules';
import { formatDateTime, formatDuration } from '../utils/dates';

interface Props {
  rule: AlertRule;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateServices: (services: AlertRule['services']) => void;
  onToast: (message: string) => void;
}

export default function AlertDetailsDrawer({ rule, onClose, onEdit, onDelete, onUpdateServices, onToast }: Props) {
  const [tab, setTab] = useState<'services' | 'history'>('services');
  const [showPicker, setShowPicker] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [serviceToRemove, setServiceToRemove] = useState<AlertService | null>(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 200);
  };

  const availableToAdd = serviceCatalog.filter((c) => !rule.services.some((s) => s.name === c.name));

  const confirmRemoveService = () => {
    if (!serviceToRemove) return;
    onUpdateServices(rule.services.filter((s) => s.id !== serviceToRemove.id));
    onToast(`${serviceToRemove.name} removed from ${rule.ruleName}`);
    setServiceToRemove(null);
  };

  const addService = (catalogItem: (typeof serviceCatalog)[number]) => {
    onUpdateServices([
      ...rule.services,
      { id: `${catalogItem.name}-${Date.now()}`, name: catalogItem.name, family: catalogItem.family, capacity: catalogItem.capacity },
    ]);
    onToast(`${catalogItem.name} added to ${rule.ruleName}`);
    setShowPicker(false);
  };

  const historyRows = rule.history
    .filter((h) => historyFilter === 'all' || h.service === historyFilter)
    .sort((a, b) => new Date(b.raisedAt).getTime() - new Date(a.raisedAt).getTime());

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-end bg-black/80 transition-opacity duration-200 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex h-full w-[800px] max-w-[95vw] flex-col bg-white transition-transform duration-200 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-none flex-col items-start justify-center gap-4 px-6 pt-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start justify-end">
              <div className="flex items-end gap-2">
                <p className="font-inter text-xl font-extrabold text-secondary-7">{rule.ruleName}</p>
                <SeverityBadge severity={rule.severity} />
              </div>
              <p className="text-sm text-secondary-6">{conditionText(rule)} &middot; held {rule.holdWindow}</p>
            </div>
            <Button variant="secondary" icon={<Icon name="close" size={20} />} onClick={handleClose}>
              Close
            </Button>
          </div>

          <div className="flex w-full items-center gap-3">
            <Button variant="secondary" icon={<Icon name="edit" size={20} />} onClick={onEdit}>
              Edit Rule
            </Button>
            <Button variant="secondary" icon={<Icon name="delete" size={20} />} onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-4 flex w-full flex-none items-center gap-0.5 border-y-[0.5px] border-secondary-2 bg-secondary-1 px-6 py-1 shadow-[0px_0.5px_2px_0px_rgba(96,97,112,0.16)]">
          {(['services', 'history'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1 overflow-clip rounded-[10px] px-3 py-2 transition-all duration-150 active:scale-95 ${
                tab === key
                  ? 'bg-white shadow-[0px_2px_4px_0px_rgba(58,58,58,0.08),0px_4px_6px_0px_rgba(58,58,58,0.06)]'
                  : 'hover:bg-white/60'
              }`}
            >
              <span className={`text-sm font-bold ${tab === key ? 'text-secondary-7' : 'text-secondary-6'}`}>
                {key === 'services' ? 'Services' : 'Alert History'}
              </span>
              <span className="inline-flex items-center justify-center rounded-lg border border-secondary-3 bg-secondary-2 px-2 py-0.5 text-[10px] font-bold text-secondary-7">
                {key === 'services' ? rule.services.length : rule.history.length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
          {tab === 'services' ? (
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full flex-col items-start">
                <p className="font-lato text-base font-extrabold text-secondary-7">Services this alert watches</p>
                <p className="text-sm text-secondary-6">
                  A service can have at most one active alert at a time. Click a service to see its current alert,
                  if any.
                </p>
              </div>

              <div className="flex w-full items-center justify-end">
                <div className="relative">
                  <Button variant="secondary" icon={<Icon name="add" size={20} />} onClick={() => setShowPicker((v) => !v)}>
                    Add Services
                  </Button>
                  {showPicker && (
                    <div className="absolute right-0 z-10 mt-2 max-h-64 w-64 origin-top-right animate-[dropdown-in_150ms_ease-out] overflow-y-auto rounded-xl border border-secondary-3 bg-white p-2 shadow-card">
                      {availableToAdd.length === 0 ? (
                        <p className="p-2 text-xs text-secondary-6">All catalog services already added.</p>
                      ) : (
                        availableToAdd.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => addService(item)}
                            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors duration-150 hover:bg-secondary-1 active:scale-[0.98]"
                          >
                            <span className="font-bold text-secondary-7">{item.name}</span>
                            <span className="text-xs text-secondary-6">{item.capacity}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                {rule.services.map((service) => {
                  const activeEntry = activeEntryForService(rule, service.name);
                  const open = expanded === service.name;
                  return (
                    <div key={service.id} className="w-full rounded-2xl border border-secondary-2 transition-colors duration-150 hover:border-secondary-4">
                      <button
                        type="button"
                        onClick={() => setExpanded(open ? null : service.name)}
                        className="flex w-full items-center gap-6 p-6 text-left"
                      >
                        <Icon
                          name="expand_more"
                          size={18}
                          className={`text-secondary-6 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                        />
                        <div className="flex flex-1 items-center gap-2">
                          <span className={`size-2 rounded-full ${activeEntry ? 'bg-red-4' : 'bg-primary-4'}`} />
                          <p className="flex-1 truncate text-sm font-bold text-secondary-7">{service.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center justify-center rounded-3xl border px-2 py-1 text-[10px] ${
                              activeEntry ? 'border-red-3 bg-red-2 text-red-5' : 'border-secondary-3 bg-secondary-1 text-secondary-6'
                            }`}
                          >
                            {activeEntry ? 'Active alert' : 'No alerts yet'}
                          </span>
                          <span className="inline-flex items-center justify-center rounded-3xl border border-secondary-3 bg-secondary-1 px-2 py-1 font-mono text-[10px] text-secondary-7">
                            {service.capacity}
                          </span>
                        </div>
                        <Tooltip label={`Remove ${service.name}`}>
                          <span
                            role="button"
                            aria-label={`Remove ${service.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setServiceToRemove(service);
                            }}
                            className="flex items-center gap-1 rounded-xl border border-secondary-3 bg-white p-2 transition-all duration-150 hover:border-red-3 hover:bg-red-2 active:scale-95"
                          >
                            <Icon name="delete" size={16} />
                          </span>
                        </Tooltip>
                      </button>
                      {open && (
                        <div className="border-t border-secondary-2 px-6 py-4">
                          {activeEntry ? (
                            <div className="flex flex-col gap-1 rounded-xl bg-red-2/40 p-4">
                              <p className="text-sm font-bold text-red-5">Currently breaching</p>
                              <p className="text-sm text-secondary-7">
                                Observed <span className="font-bold">{activeEntry.observed}</span> &middot; raised{' '}
                                {formatDateTime(activeEntry.raisedAt)} &middot;{' '}
                                <span className="font-bold text-red-5">{formatDuration(activeEntry.raisedAt)}</span>
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-secondary-6">No active alert on this service right now.</p>
                          )}
                          {entriesForService(rule, service.name).filter((e) => e.status === 'resolved').length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setTab('history');
                                setHistoryFilter(service.name);
                              }}
                              className="mt-3 text-sm font-bold text-primary-5 hover:underline"
                            >
                              See past alerts for this service in history &rarr;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col items-start gap-4">
              <div className="flex w-full flex-col items-start">
                <p className="font-lato text-base font-extrabold text-secondary-7">Alert history</p>
                <p className="text-sm text-secondary-6">Every past and current alert this rule has raised, newest first.</p>
              </div>

              {rule.history.length > 1 && (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-secondary-7">Service</label>
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="cursor-pointer rounded-xl border border-secondary-3 px-3 py-1.5 text-sm text-secondary-7 outline-none transition-colors duration-150 hover:border-secondary-4 focus:border-primary-4"
                  >
                    <option value="all">All services ({rule.history.length})</option>
                    {rule.services.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({rule.history.filter((h) => h.service === s.name).length})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {historyRows.length === 0 ? (
                <p className="py-8 text-sm text-secondary-6">No alert history recorded for this rule yet.</p>
              ) : (
                <div className="flex w-full flex-col gap-3">
                  {historyRows.map((entry) => (
                    <div key={entry.id} className="flex w-full items-start gap-4 rounded-2xl border border-secondary-2 p-4">
                      <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${entry.status === 'active' ? 'bg-red-4' : 'bg-primary-4'}`} />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-secondary-7">{entry.service}</p>
                          <span
                            className={`inline-flex items-center justify-center rounded-3xl border px-2 py-0.5 text-[10px] ${
                              entry.status === 'active' ? 'border-red-3 bg-red-2 text-red-5' : 'border-primary-3 bg-primary-2 text-primary-5'
                            }`}
                          >
                            {entry.status === 'active' ? 'Active' : 'Returned to normal'}
                          </span>
                          <span className="font-mono text-[11px] text-secondary-6">observed {entry.observed}</span>
                        </div>
                        <p className="mt-1 text-sm text-secondary-6">
                          Raised {formatDateTime(entry.raisedAt)}
                          {entry.status === 'resolved' && entry.clearedAt ? (
                            <>
                              {' '}
                              &middot; Cleared {formatDateTime(entry.clearedAt)} &middot; Duration{' '}
                              {formatDuration(entry.raisedAt, entry.clearedAt)}
                            </>
                          ) : (
                            <> &middot; <span className="font-bold text-red-5">{formatDuration(entry.raisedAt)}</span></>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {serviceToRemove && (
        <ConfirmModal
          title="Remove this service?"
          confirmLabel="Remove Service"
          warning="This action can't be undone."
          onClose={() => setServiceToRemove(null)}
          onConfirm={confirmRemoveService}
          message={
            <>
              <span className="font-extrabold">{serviceToRemove.name}</span>
              <span className="font-normal">
                {' '}
                will stop being watched by <span className="font-extrabold">{rule.ruleName}</span>. You can add it
                back at any time from the services list.
              </span>
            </>
          }
        />
      )}
    </div>
  );
}
