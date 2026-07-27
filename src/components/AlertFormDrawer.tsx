import { useEffect, useMemo, useState } from 'react';
import type { AlertRule } from '../types';
import Button from './Button';
import Icon from './Icon';
import { AGGREGATIONS, HOLD_WINDOWS, metricByKey, metricCatalog, serviceCatalog } from '../data/catalog';

interface Props {
  mode: 'create' | 'edit';
  initial?: AlertRule;
  onClose: () => void;
  onSave: (data: Omit<AlertRule, 'id' | 'history' | 'createdAt'>) => void;
}

const fieldClass =
  'w-full rounded-xl border border-secondary-3 px-4 py-2 text-sm text-secondary-7 outline-none transition-colors duration-150 hover:border-secondary-4 focus:border-primary-4 focus:ring-4 focus:ring-primary-3/30';
const labelClass = 'text-sm font-bold text-secondary-7';

export default function AlertFormDrawer({ mode, initial, onClose, onSave }: Props) {
  const [ruleName, setRuleName] = useState(initial?.ruleName ?? '');
  const [metricKey, setMetricKey] = useState(initial?.metricKey ?? metricCatalog[0].key);
  const [aggregation, setAggregation] = useState(initial?.aggregation ?? 'AVG');
  const [threshold, setThreshold] = useState(initial?.threshold ?? metricCatalog[0].defaultThreshold);
  const [holdWindow, setHoldWindow] = useState(initial?.holdWindow ?? '15 min');
  const [selectedServices, setSelectedServices] = useState<string[]>(initial?.services.map((s) => s.name) ?? []);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 200);
  };

  const metric = metricByKey(metricKey);
  const eligibleServices = useMemo(
    () => serviceCatalog.filter((s) => metric.products.includes(s.family)),
    [metric],
  );

  const pickMetric = (key: string) => {
    const m = metricByKey(key);
    setMetricKey(key);
    setThreshold(m.defaultThreshold);
    if (!initial) setSelectedServices([]);
  };

  const canSave = ruleName.trim().length > 0 && threshold.trim().length > 0 && selectedServices.length > 0;

  const toggleService = (name: string) => {
    setSelectedServices((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const handleSave = () => {
    if (!canSave) return;
    const services = serviceCatalog
      .filter((c) => selectedServices.includes(c.name))
      .map((c) => ({ id: `${c.name}-${Date.now()}`, name: c.name, family: c.family, capacity: c.capacity }));
    onSave({
      ruleName: ruleName.trim(),
      metricKey,
      severity: metric.severity,
      aggregation,
      comparator: metric.comparator,
      threshold: threshold.trim(),
      holdWindow,
      services,
    });
  };

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-end bg-black/80 transition-opacity duration-200 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex h-full w-[600px] max-w-[95vw] flex-col bg-white transition-transform duration-200 ease-out ${
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

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Metric</label>
              <div className="grid grid-cols-2 gap-2">
                {metricCatalog.map((m) => {
                  const on = metricKey === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => pickMetric(m.key)}
                      title={m.description}
                      className={`flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-all duration-150 active:scale-[0.98] ${
                        on ? 'border-primary-5 bg-primary-2' : 'border-secondary-3 bg-white hover:border-secondary-4 hover:bg-secondary-1'
                      }`}
                    >
                      <span className="text-sm font-bold text-secondary-7">{m.label}</span>
                      <span className="text-xs text-secondary-6">{m.products.join(' / ')}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-secondary-6">{metric.description}</p>
            </div>

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
                <span className="whitespace-nowrap text-sm text-secondary-7">{metric.label} {metric.direction}</span>
                <input
                  className={`${fieldClass} w-[100px]`}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                />
                <span className="whitespace-nowrap text-sm text-secondary-6">{metric.unit || '—'}</span>
              </div>
            </div>

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
              <p className="text-xs text-secondary-6">
                A breach must hold this long before an alert is raised, so brief blips don&apos;t trigger it.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Services this alert watches</label>
              <div className="flex flex-col gap-2 rounded-xl border border-secondary-2 p-2">
                {eligibleServices.length === 0 ? (
                  <p className="p-2 text-xs text-secondary-6">No services support this metric.</p>
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
          </div>
        </div>

        <div className="flex flex-none items-center justify-end gap-3 border-t border-secondary-2 px-6 py-4">
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
  );
}
