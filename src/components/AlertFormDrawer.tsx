import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlertRule, FlapEventType, NotifyChannel, Recipient, SlaTier } from '../types';
import Button from './Button';
import Icon from './Icon';
import Toggle from './Toggle';
import {
  CURRENT_USER,
  HOLD_WINDOWS,
  NOTIFY_CHANNELS,
  PRODUCT_FAMILIES,
  SLA_TIERS,
  familyForMetric,
  familyProducts,
  metricByKey,
  metricCatalog,
  metricFamilies,
  serviceCatalog,
  userDirectory,
} from '../data/catalog';

// Labels the second dropdown when a metric family has more than one variant —
// "Direction" for In/Out pairs, "Type" for Power's Transmitted/Received/Levels.
const FAMILY_VARIANT_FIELD_LABEL: Record<string, string> = {
  traffic: 'Direction',
  packets: 'Direction',
  power: 'Type',
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AlertRule;
  onClose: () => void;
  onSave: (data: Omit<AlertRule, 'id' | 'history' | 'createdAt'>) => void;
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
  const [threshold, setThreshold] = useState(initial?.threshold ?? metricCatalog[0].defaultThreshold);
  const [holdWindow, setHoldWindow] = useState(initial?.holdWindow ?? '15 min');
  const [slaTier, setSlaTier] = useState<SlaTier>(initial?.slaTier ?? 'expected');
  const [flapEventType, setFlapEventType] = useState<FlapEventType>(initial?.flapEventType ?? 'flap');
  const [switchoverLocation, setSwitchoverLocation] = useState(initial?.switchoverLocation ?? true);
  const [selectedServices, setSelectedServices] = useState<string[]>(initial?.services.map((s) => s.name) ?? []);
  const [familyFilter, setFamilyFilter] = useState<'all' | 'VC' | 'Wave' | 'Port'>('all');
  const [showServicePicker, setShowServicePicker] = useState(false);
  const servicePickerRef = useRef<HTMLDivElement>(null);
  const [emailOn, setEmailOn] = useState(initial?.channels.includes('Email') ?? false);
  const channels: NotifyChannel[] = emailOn ? ['In-app', 'Email'] : ['In-app'];
  const [recipients, setRecipients] = useState<Recipient[]>(
    initial?.recipients ?? [{ email: CURRENT_USER.email, name: CURRENT_USER.name }],
  );
  const [recipientQuery, setRecipientQuery] = useState('');
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
  const currentFamily = familyForMetric(metricKey);
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

  const missingReasons: string[] = [];
  if (ruleName.trim().length === 0) missingReasons.push('a rule name');
  if (isFlaps && flapEventType === 'flap' && threshold.trim().length === 0) missingReasons.push('a flap count');
  if (!isFlaps && threshold.trim().length === 0) missingReasons.push('a threshold value');
  if (isAvailability && slaTier === 'custom' && threshold.trim().length === 0) missingReasons.push('a custom threshold');
  if (selectedServices.length === 0) missingReasons.push('at least one service');
  if (emailOn && recipients.length === 0) missingReasons.push('at least one recipient');

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
      aggregation: metric.defaultAggregation,
      comparator: metric.comparator,
      threshold: resolvedThreshold,
      holdWindow,
      services,
      channels,
      recipients,
      slaTier: isAvailability ? slaTier : undefined,
      flapEventType: isFlaps ? flapEventType : undefined,
      switchoverLocation: isFlaps && flapEventType === 'switchover' ? switchoverLocation : undefined,
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
                  value={currentFamily.key}
                  onChange={(e) => {
                    const fam = metricFamilies.find((f) => f.key === e.target.value)!;
                    pickMetric(fam.members[0].key);
                  }}
                  className={`${fieldClass} cursor-pointer`}
                >
                  {metricFamilies.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label} ({familyProducts(f).join(' / ')})
                    </option>
                  ))}
                </select>
              </div>
              {currentFamily.members.length > 1 && (
                <div className="flex w-[130px] flex-col gap-1.5">
                  <label className={labelClass}>{FAMILY_VARIANT_FIELD_LABEL[currentFamily.key] ?? 'Type'}</label>
                  <select
                    value={metricKey}
                    onChange={(e) => pickMetric(e.target.value)}
                    className={`${fieldClass} cursor-pointer`}
                  >
                    {currentFamily.members.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.variantLabel ?? m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Condition</label>
                <p className="text-xs text-secondary-6">Pick the one event this alert should watch for.</p>
                <select
                  value={flapEventType}
                  onChange={(e) => setFlapEventType(e.target.value as FlapEventType)}
                  className={`${fieldClass} cursor-pointer`}
                >
                  <option value="switchover">Switch Over — traffic moved to the secondary path</option>
                  <option value="flap">Flap — the link is bouncing up and down repeatedly</option>
                  <option value="outage">Outage — both paths are down</option>
                </select>

                {flapEventType === 'switchover' && (
                  <label className="mt-1 flex cursor-pointer items-center gap-2 text-sm text-secondary-7">
                    <input
                      type="checkbox"
                      checked={switchoverLocation}
                      onChange={() => setSwitchoverLocation((v) => !v)}
                      className="accent-primary-4"
                    />
                    Notify with location &amp; time of the switchover
                  </label>
                )}

                {flapEventType === 'flap' && (
                  <div className="mt-1 flex items-center gap-2 text-sm text-secondary-7">
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

                {flapEventType === 'outage' && (
                  <p className="mt-1 text-xs text-secondary-6">
                    Notified immediately — both paths down needs no extra setup.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Condition</label>
                <p className="text-xs text-secondary-6">Just enter the one number that should trigger this alert.</p>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap rounded-lg border border-secondary-3 bg-secondary-1 px-3 py-2 text-sm font-bold text-secondary-7">
                    {metric.label} {metric.direction}
                  </span>
                  <input
                    className={`${fieldClass} w-[120px]`}
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    placeholder={metric.defaultThreshold}
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
                            className={`flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 transition-colors duration-150 ${
                              checked ? 'bg-primary-2' : 'hover:bg-secondary-1'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(service.name)}
                              className="mt-0.5 accent-primary-4"
                            />
                            <span className="flex flex-1 items-center justify-between gap-2">
                              <span>
                                <span className="block text-sm font-bold text-secondary-7">{service.name}</span>
                                <span className="flex items-center gap-1.5 text-[11px] text-secondary-6">
                                  <span className="rounded border border-secondary-3 px-1 py-0.5 font-mono text-[9px] font-bold text-secondary-6">
                                    {service.family}
                                  </span>
                                  {service.location}
                                </span>
                              </span>
                              <span className="whitespace-nowrap font-mono text-[10px] text-secondary-6">{service.capacity}</span>
                            </span>
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
                <div className="flex flex-col gap-2 rounded-xl border border-secondary-2 p-2">
                  <div className="flex items-start justify-between gap-3 rounded-lg bg-primary-2 px-3 py-3">
                    <div className="flex items-start gap-3">
                      <Icon name="notifications_active" size={20} filled className="mt-0.5 flex-none text-primary-5" />
                      <div>
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-bold text-secondary-7">In-app</span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-6">
                            Always on
                          </span>
                        </span>
                        <p className="mt-0.5 text-xs text-secondary-6">
                          Every alert notifies in-app automatically — it shows up on your Dashboard, on the affected
                          Service page, and in the notification bell at the top of the screen. Included with every
                          rule and can&apos;t be turned off.
                        </p>
                      </div>
                    </div>
                    <div
                      title="Always on — can't be turned off"
                      className="pointer-events-none flex-none cursor-not-allowed pt-0.5 opacity-80"
                    >
                      <Toggle on onToggle={() => {}} size="sm" label="In-app notifications (always on)" />
                    </div>
                  </div>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition-colors duration-150 ${
                      emailOn ? 'bg-primary-2' : 'hover:bg-secondary-1'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={emailOn}
                      onChange={() => setEmailOn((v) => !v)}
                      className="mt-0.5 accent-primary-4"
                    />
                    <span>
                      <span className="block text-sm font-bold text-secondary-7">Email</span>
                      <span className="block text-xs text-secondary-6">
                        {NOTIFY_CHANNELS.find((c) => c.key === 'Email')!.detail}
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {emailOn && (
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    Recipients <span className="text-red-5">*</span>
                  </label>
                  <p className="-mt-1 text-xs text-secondary-6">
                    Each person receives the alert email at the address shown below — pick an existing user or
                    invite someone new by email.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((r) => (
                      <span
                        key={r.email}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                          r.invited ? 'border-orange-3 bg-yellow-2 text-secondary-7' : 'border-secondary-3 bg-white text-secondary-7'
                        }`}
                      >
                        {r.name ?? r.email}
                        {r.email === CURRENT_USER.email && (
                          <span className="rounded bg-primary-2 px-1.5 py-0.5 text-[9px] font-bold text-primary-6">You</span>
                        )}
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
