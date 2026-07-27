import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlertRule, FlapEvents, NotifyChannel, Recipient, SlaTier } from '../types';
import Button from './Button';
import Icon from './Icon';
import Toggle from './Toggle';
import {
  AGGREGATIONS,
  FREQUENCIES,
  HOLD_WINDOWS,
  NOTIFY_CHANNELS,
  PRODUCT_FAMILIES,
  SLA_TIERS,
  metricByKey,
  metricCatalog,
  serviceCatalog,
  userDirectory,
} from '../data/catalog';

interface Props {
  mode: 'create' | 'edit';
  initial?: AlertRule;
  onClose: () => void;
  onSave: (data: Omit<AlertRule, 'id' | 'history' | 'createdAt' | 'enabled'>) => void;
}

const fieldClass =
  'w-full rounded-xl border border-secondary-3 px-4 py-2 text-sm text-secondary-7 outline-none transition-colors duration-150 hover:border-secondary-4 focus:border-primary-4 focus:ring-4 focus:ring-primary-3/30';
const labelClass = 'text-sm font-bold text-secondary-7';
const sectionLabel = 'text-xs font-bold uppercase tracking-wide text-secondary-6';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function AlertFormDrawer({ mode, initial, onClose, onSave }: Props) {
  const [ruleName, setRuleName] = useState(initial?.ruleName ?? '');
  const [metricKey, setMetricKey] = useState(initial?.metricKey ?? metricCatalog[0].key);
  const [severity, setSeverity] = useState(initial?.severity ?? metricByKey(metricCatalog[0].key).severity);
  const [aggregation, setAggregation] = useState(initial?.aggregation ?? 'AVG');
  const [threshold, setThreshold] = useState(initial?.threshold ?? metricCatalog[0].defaultThreshold);
  const [holdWindow, setHoldWindow] = useState(initial?.holdWindow ?? '15 min');
  const [slaTier, setSlaTier] = useState<SlaTier>(initial?.slaTier ?? 'expected');
  const [flapEvents, setFlapEvents] = useState<FlapEvents>(
    initial?.flapEvents ?? { switchover: true, flap: true, outage: true },
  );
  const [switchoverLocation, setSwitchoverLocation] = useState(initial?.switchoverLocation ?? true);
  const [selectedServices, setSelectedServices] = useState<string[]>(initial?.services.map((s) => s.name) ?? []);
  const [familyFilter, setFamilyFilter] = useState<'all' | 'VC' | 'Wave' | 'Port'>('all');
  const [showServicePicker, setShowServicePicker] = useState(false);
  const servicePickerRef = useRef<HTMLDivElement>(null);
  const [channels, setChannels] = useState<NotifyChannel[]>(initial?.channels ?? ['In-app', 'Email']);
  const [recipients, setRecipients] = useState<Recipient[]>(initial?.recipients ?? []);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [frequency, setFrequency] = useState(initial?.frequency ?? 'Real-time');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!showServicePicker) return;
    const onClick = (e: MouseEvent) => {
      if (servicePickerRef.current && !servicePickerRef.current.contains(e.target as Node)) setShowServicePicker(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showServicePicker]);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 200);
  };

  const metric = metricByKey(metricKey);
  const isAvailability = metricKey === 'availability';
  const isFlaps = metricKey === 'flaps';

  const availableFamilies = PRODUCT_FAMILIES.filter((f) => f.key === 'all' || metric.products.includes(f.key));
  const eligibleServices = useMemo(
    () =>
      serviceCatalog.filter(
        (s) => metric.products.includes(s.family) && (familyFilter === 'all' || s.family === familyFilter),
      ),
    [metric, familyFilter],
  );

  const pickMetric = (key: string) => {
    const m = metricByKey(key);
    setMetricKey(key);
    setSeverity(m.severity);
    setThreshold(m.defaultThreshold);
    setFamilyFilter('all');
    // Drop any selected services that don't support the newly picked metric,
    // in create AND edit mode — otherwise a stale, incompatible service could
    // silently ride along on save.
    setSelectedServices((prev) =>
      prev.filter((name) => {
        const s = serviceCatalog.find((c) => c.name === name);
        return s && m.products.includes(s.family);
      }),
    );
  };

  const toggleService = (name: string) => {
    setSelectedServices((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const toggleChannel = (c: NotifyChannel) => {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const toggleFlapEvent = (key: keyof FlapEvents) => {
    setFlapEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const q = recipientQuery.trim().toLowerCase();
  const directoryMatches = userDirectory.filter(
    (u) => !recipients.some((r) => r.email === u.email) && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
  );
  const isNewEmail = q.length > 0 && EMAIL_RE.test(q) && !userDirectory.some((u) => u.email.toLowerCase() === q);

  const addRecipient = (email: string, name?: string) => {
    setRecipients((prev) => [...prev, { email, name }]);
    setRecipientQuery('');
  };
  const inviteRecipient = (email: string) => {
    setRecipients((prev) => [...prev, { email, invited: true }]);
    setRecipientQuery('');
  };
  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r.email !== email));
  };

  const flapAnySelected = flapEvents.switchover || flapEvents.flap || flapEvents.outage;

  const missingReasons: string[] = [];
  if (ruleName.trim().length === 0) missingReasons.push('a rule name');
  if (isFlaps && !flapAnySelected) missingReasons.push('at least one Flaps event');
  if (isFlaps && flapEvents.flap && threshold.trim().length === 0) missingReasons.push('a flap count');
  if (!isFlaps && threshold.trim().length === 0) missingReasons.push('a threshold value');
  if (isAvailability && slaTier === 'custom' && threshold.trim().length === 0) missingReasons.push('a custom threshold');
  if (selectedServices.length === 0) missingReasons.push('at least one service');
  if (channels.length === 0) missingReasons.push('a notification channel');
  if (channels.includes('Email') && recipients.length === 0) missingReasons.push('at least one recipient');

  const canSave = missingReasons.length === 0;

  const handleSave = () => {
    if (!canSave) return;
    const services = serviceCatalog
      .filter((c) => selectedServices.includes(c.name))
      .map((c) => ({ id: `${c.name}-${Date.now()}`, name: c.name, family: c.family, capacity: c.capacity }));

    const resolvedThreshold = isAvailability
      ? slaTier === 'custom'
        ? threshold.trim()
        : SLA_TIERS.find((t) => t.key === slaTier)!.value
      : threshold.trim();

    onSave({
      ruleName: ruleName.trim(),
      metricKey,
      severity,
      aggregation: isFlaps ? 'COUNT' : aggregation,
      comparator: metric.comparator,
      threshold: resolvedThreshold,
      holdWindow,
      services,
      channels,
      recipients,
      frequency,
      slaTier: isAvailability ? slaTier : undefined,
      flapEvents: isFlaps ? flapEvents : undefined,
      switchoverLocation: isFlaps ? switchoverLocation : undefined,
    });
  };

  const serviceSummary =
    selectedServices.length === 0
      ? 'Select services…'
      : selectedServices.length <= 2
        ? selectedServices.join(', ')
        : `${selectedServices.slice(0, 2).join(', ')} +${selectedServices.length - 2} more`;

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-end bg-black/80 transition-opacity duration-200 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex h-full w-[560px] max-w-[95vw] flex-col bg-white transition-transform duration-200 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-none items-center justify-between border-b border-secondary-2 px-6 py-6">
          <p className="font-inter text-xl font-extrabold text-secondary-7">
            {mode === 'create' ? 'Create Alert Rule' : 'Edit Alert Rule'}
          </p>
          <Button variant="secondary" icon={<Icon name="close" size={20} />} onClick={handleClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Rule Name</label>
              <input
                className={fieldClass}
                placeholder="e.g. Production Availability Drop"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className={labelClass}>Metric</label>
                <select
                  value={metricKey}
                  onChange={(e) => pickMetric(e.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {metricCatalog.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} ({m.products.join(' / ')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[140px] flex-col gap-1.5">
                <label className={labelClass}>Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'Critical' | 'Info')}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="Critical">Critical</option>
                  <option value="Info">Info</option>
                </select>
              </div>
            </div>
            <p className="-mt-3 text-xs text-secondary-6">{metric.description}</p>

            {/* Condition — branches per metric type */}
            {isAvailability ? (
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Alert against</label>
                <div className="grid grid-cols-3 gap-2">
                  {SLA_TIERS.map((t) => {
                    const on = slaTier === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        title={t.note}
                        onClick={() => {
                          setSlaTier(t.key);
                          if (t.key !== 'custom') setThreshold(t.value);
                          else setThreshold('');
                        }}
                        className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left transition-all duration-150 active:scale-[0.98] ${
                          on ? 'border-primary-5 bg-primary-2' : 'border-secondary-3 bg-white hover:border-secondary-4 hover:bg-secondary-1'
                        }`}
                      >
                        <span className="text-sm font-bold text-secondary-7">{t.label}</span>
                        <span className="text-xs text-secondary-6">{t.key === 'custom' ? '—' : `${t.value}%`}</span>
                      </button>
                    );
                  })}
                </div>
                {slaTier === 'custom' && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-secondary-7">Availability drops below</span>
                    <input
                      className={`${fieldClass} w-[100px]`}
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      placeholder="99.5"
                    />
                    <span className="text-sm text-secondary-6">%</span>
                  </div>
                )}
              </div>
            ) : isFlaps ? (
              <div className="flex flex-col gap-3">
                <label className={labelClass}>Condition</label>
                <p className="text-xs text-secondary-6">Turn on the events you care about.</p>

                <div className={`rounded-xl border p-3 ${flapEvents.switchover ? 'border-primary-4 bg-primary-2/40' : 'border-secondary-3'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-secondary-7">Switch Over</p>
                      <p className="text-xs text-secondary-6">Traffic moved to the secondary path — awareness only.</p>
                    </div>
                    <Toggle on={flapEvents.switchover} onToggle={() => toggleFlapEvent('switchover')} label="Switch Over" />
                  </div>
                  {flapEvents.switchover && (
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-secondary-7">
                      <input
                        type="checkbox"
                        checked={switchoverLocation}
                        onChange={() => setSwitchoverLocation((v) => !v)}
                        className="accent-primary-4"
                      />
                      Notify with location &amp; time of the switchover
                    </label>
                  )}
                </div>

                <div className={`rounded-xl border p-3 ${flapEvents.flap ? 'border-primary-4 bg-primary-2/40' : 'border-secondary-3'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-secondary-7">Flap</p>
                      <p className="text-xs text-secondary-6">The link is bouncing up and down repeatedly.</p>
                    </div>
                    <Toggle on={flapEvents.flap} onToggle={() => toggleFlapEvent('flap')} label="Flap" />
                  </div>
                  {flapEvents.flap && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-secondary-7">
                      Exceeds
                      <input
                        className={`${fieldClass} w-[80px]`}
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                      />
                      times in
                      <select
                        value={holdWindow}
                        onChange={(e) => setHoldWindow(e.target.value)}
                        className={`${fieldClass} w-[110px] cursor-pointer`}
                      >
                        {HOLD_WINDOWS.map((w) => (
                          <option key={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className={`rounded-xl border p-3 ${flapEvents.outage ? 'border-primary-4 bg-primary-2/40' : 'border-secondary-3'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-secondary-7">Outage</p>
                      <p className="text-xs text-secondary-6">Both paths are down — notified immediately.</p>
                    </div>
                    <Toggle on={flapEvents.outage} onToggle={() => toggleFlapEvent('outage')} label="Outage" />
                  </div>
                </div>
                {!flapAnySelected && <p className="text-xs font-bold text-red-5">Turn on at least one event.</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Condition</label>
                <div className="flex items-center gap-2">
                  <select
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value)}
                    className={`${fieldClass} w-[90px] cursor-pointer font-mono`}
                  >
                    {AGGREGATIONS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                  <span className="whitespace-nowrap text-sm text-secondary-7">
                    {metric.label} {metric.direction}
                  </span>
                  <input
                    className={`${fieldClass} w-[100px]`}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                  <span className="whitespace-nowrap text-sm text-secondary-6">{metric.unit || '—'}</span>
                </div>
              </div>
            )}

            {!isFlaps && (
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Hold for</label>
                <div className="flex flex-wrap gap-2">
                  {HOLD_WINDOWS.map((w) => {
                    const on = holdWindow === w;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setHoldWindow(w)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-bold transition-all duration-150 active:scale-95 ${
                          on
                            ? 'border-primary-5 bg-primary-5 text-secondary-1'
                            : 'border-secondary-3 bg-white text-secondary-7 hover:border-secondary-4 hover:bg-secondary-1'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="relative flex flex-col gap-1.5" ref={servicePickerRef}>
              <label className={labelClass}>Services this alert watches</label>
              <button
                type="button"
                onClick={() => setShowServicePicker((v) => !v)}
                className={`${fieldClass} flex cursor-pointer items-center justify-between text-left`}
              >
                <span className={selectedServices.length ? 'text-secondary-7' : 'text-secondary-6'}>{serviceSummary}</span>
                <Icon name={showServicePicker ? 'expand_less' : 'expand_more'} size={20} className="text-secondary-6" />
              </button>

              {showServicePicker && (
                <div className="absolute top-full z-20 mt-1 w-full origin-top animate-[dropdown-in_150ms_ease-out] rounded-xl border border-secondary-3 bg-white p-2 shadow-card">
                  {availableFamilies.length > 2 && (
                    <div className="flex flex-wrap gap-1.5 border-b border-secondary-2 p-1 pb-2">
                      {availableFamilies.map((f) => {
                        const on = familyFilter === f.key;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => setFamilyFilter(f.key)}
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold transition-colors duration-150 ${
                              on ? 'border-primary-5 bg-primary-5 text-secondary-1' : 'border-secondary-3 bg-white text-secondary-7 hover:bg-secondary-1'
                            }`}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="max-h-56 overflow-y-auto">
                    {eligibleServices.length === 0 ? (
                      <p className="p-2 text-xs text-secondary-6">No services match this filter.</p>
                    ) : (
                      eligibleServices.map((service) => {
                        const checked = selectedServices.includes(service.name);
                        return (
                          <label
                            key={service.name}
                            className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150 ${
                              checked ? 'bg-primary-2' : 'hover:bg-secondary-1'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleService(service.name)}
                                className="accent-primary-4"
                              />
                              <span className="text-sm font-bold text-secondary-7">{service.name}</span>
                            </span>
                            <span className="font-mono text-[10px] text-secondary-6">{service.capacity}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              <p className="text-xs text-secondary-6">{selectedServices.length} service{selectedServices.length === 1 ? '' : 's'} selected.</p>
            </div>

            <div className="flex flex-col gap-3 border-t border-secondary-2 pt-5">
              <p className={sectionLabel}>Notifications</p>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Notify by</label>
                <div className="flex gap-2">
                  {NOTIFY_CHANNELS.map((c) => {
                    const on = channels.includes(c.key);
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => toggleChannel(c.key)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all duration-150 active:scale-95 ${
                          on
                            ? 'border-primary-5 bg-primary-5 text-secondary-1'
                            : 'border-secondary-3 bg-white text-secondary-7 hover:border-secondary-4 hover:bg-secondary-1'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                {channels.length === 0 && <p className="text-xs font-bold text-red-5">Pick at least one channel.</p>}
              </div>

              {channels.includes('Email') && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    Recipients <span className="text-red-5">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((r) => (
                      <span
                        key={r.email}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                          r.invited ? 'border-orange-3 bg-yellow-2 text-secondary-7' : 'border-secondary-3 bg-white text-secondary-7'
                        }`}
                      >
                        {r.name ?? r.email}
                        {r.invited && (
                          <span className="rounded bg-orange-5 px-1.5 py-0.5 text-[9px] font-bold text-white">Invite pending</span>
                        )}
                        <button
                          type="button"
                          aria-label={`Remove ${r.email}`}
                          onClick={() => removeRecipient(r.email)}
                          className="flex items-center justify-center rounded-full transition-colors duration-150 hover:text-red-5"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </span>
                    ))}
                    {recipients.length === 0 && <span className="text-xs text-secondary-6">No recipients yet.</span>}
                  </div>

                  <input
                    className={fieldClass}
                    placeholder="Search name or email…"
                    value={recipientQuery}
                    onChange={(e) => setRecipientQuery(e.target.value)}
                  />
                  {recipientQuery.trim().length > 0 && (
                    <div className="rounded-xl border border-secondary-3 bg-white p-1">
                      {directoryMatches.map((u) => (
                        <button
                          key={u.email}
                          type="button"
                          onClick={() => addRecipient(u.email, u.name)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors duration-150 hover:bg-secondary-1"
                        >
                          <span>
                            <span className="block text-sm font-bold text-secondary-7">{u.name}</span>
                            <span className="block text-xs text-secondary-6">
                              {u.email} &middot; {u.role}
                            </span>
                          </span>
                          <span className="rounded-full border border-primary-3 px-2 py-0.5 text-xs font-bold text-primary-5">Add</span>
                        </button>
                      ))}
                      {isNewEmail && (
                        <button
                          type="button"
                          onClick={() => inviteRecipient(recipientQuery.trim().toLowerCase())}
                          className="flex w-full items-center justify-between rounded-lg bg-yellow-2 px-3 py-2 text-left transition-colors duration-150 hover:bg-yellow-2/70"
                        >
                          <span>
                            <span className="block text-sm font-bold text-secondary-7">Invite {recipientQuery.trim()}</span>
                            <span className="block text-xs text-secondary-6">Not on Polarin yet — invite sent once saved</span>
                          </span>
                          <span className="rounded-full border border-orange-5 px-2 py-0.5 text-xs font-bold text-orange-5">Invite</span>
                        </button>
                      )}
                      {!directoryMatches.length && !isNewEmail && (
                        <p className="px-3 py-2 text-xs text-secondary-6">No users match. Type a full email to invite someone new.</p>
                      )}
                    </div>
                  )}
                  {recipients.some((r) => r.invited) && (
                    <p className="rounded-xl border border-orange-3 bg-yellow-2 px-3 py-2 text-xs text-secondary-7">
                      New recipients get an invite to join Polarin once this alert is saved.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className={`${fieldClass} w-[220px] cursor-pointer`}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-none items-center justify-between gap-3 border-t border-secondary-2 px-6 py-4">
          {!canSave && (
            <p className="text-xs text-secondary-6">
              Add {missingReasons.join(', ')} to continue.
            </p>
          )}
          <div className="ml-auto flex items-center gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={mode === 'create' ? <Icon name="add" size={20} className="invert" /> : undefined}
              disabled={!canSave}
              onClick={handleSave}
            >
              {mode === 'create' ? 'Create Alert' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
