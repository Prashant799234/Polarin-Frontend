import { useEffect, useState } from 'react';
import type { AlertRule, Severity } from '../types';
import Button from './Button';
import closeIcon from '../assets/icons/close.svg';
import addIcon from '../assets/icons/add.svg';
import keyboardArrowDown from '../assets/icons/keyboard-arrow-down.svg';
import { metricOptions, serviceCatalog } from '../data/mockAlerts';

interface Props {
  mode: 'create' | 'edit';
  initial?: AlertRule;
  onClose: () => void;
  onSave: (data: Omit<AlertRule, 'id' | 'status' | 'activeAlertCount' | 'timestamp'>) => void;
}

const AGGREGATIONS = ['MAX', 'MIN', 'AVG'];
const COMPARATORS = ['>', '<', '>=', '<='];
const SEVERITIES: Severity[] = ['Critical', 'Info'];

const fieldClass =
  'w-full rounded-xl border border-secondary-3 px-4 py-2 text-sm text-secondary-7 outline-none transition-colors duration-150 hover:border-secondary-4 focus:border-primary-4';
const labelClass = 'text-sm font-bold text-secondary-7';

export default function AlertFormDrawer({ mode, initial, onClose, onSave }: Props) {
  const [ruleName, setRuleName] = useState(initial?.ruleName ?? '');
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? 'Critical');
  const [aggregation, setAggregation] = useState(initial?.aggregation ?? 'MAX');
  const [metric, setMetric] = useState(initial?.metric ?? metricOptions[0]);
  const [comparator, setComparator] = useState(initial?.comparator ?? '>');
  const [threshold, setThreshold] = useState(initial?.threshold ?? '');
  const [eventType, setEventType] = useState(initial?.eventType ?? metricOptions[0]);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initial?.services.map((s) => s.name) ?? [],
  );
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    window.setTimeout(onClose, 200);
  };

  const canSave = ruleName.trim().length > 0 && threshold.trim().length > 0 && selectedServices.length > 0;

  const toggleService = (name: string) => {
    setSelectedServices((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const handleSave = () => {
    if (!canSave) return;
    const services = serviceCatalog
      .filter((c) => selectedServices.includes(c.name))
      .map((c) => ({ id: `${c.id}-${Date.now()}`, name: c.name, activeAlerts: 0, capacity: c.capacity }));
    onSave({ ruleName: ruleName.trim(), severity, aggregation, metric, comparator, threshold: threshold.trim(), eventType, services });
  };

  return (
    <div
      className={`fixed inset-0 z-40 flex justify-end bg-black/80 transition-opacity duration-200 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`flex h-full w-[560px] max-w-[95vw] flex-col items-start overflow-y-auto bg-white py-6 transition-transform duration-200 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full items-center justify-between border-b border-secondary-2 px-6 pb-6">
          <p className="font-inter text-xl font-extrabold text-secondary-7">
            {mode === 'create' ? 'Create Alert Rule' : 'Edit Alert Rule'}
          </p>
          <Button variant="secondary" icon={<img src={closeIcon} alt="" className="size-5" />} onClick={handleClose}>
            Close
          </Button>
        </div>

        <div className="flex w-full flex-col gap-5 px-6 py-6">
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
            <label className={labelClass}>Severity</label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => {
                const active = severity === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`flex-1 rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-150 active:scale-95 ${
                      active
                        ? s === 'Critical'
                          ? 'border-red-3 bg-red-2 text-red-5'
                          : 'border-blue-3 bg-blue-2 text-blue-5'
                        : 'border-secondary-3 bg-white text-secondary-6 hover:border-secondary-4 hover:bg-secondary-1'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
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
              <select value={metric} onChange={(e) => setMetric(e.target.value)} className={`${fieldClass} cursor-pointer`}>
                {metricOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <select
                value={comparator}
                onChange={(e) => setComparator(e.target.value)}
                className={`${fieldClass} w-[70px] cursor-pointer font-mono`}
              >
                {COMPARATORS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input
                className={`${fieldClass} w-[110px]`}
                placeholder="1%"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Event Type</label>
            <div className="relative">
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className={`${fieldClass} cursor-pointer appearance-none pr-10`}
              >
                {metricOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <img src={keyboardArrowDown} alt="" className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Services this alert watches</label>
            <div className="flex flex-col gap-2 rounded-xl border border-secondary-2 p-2">
              {serviceCatalog.map((service) => {
                const checked = selectedServices.includes(service.name);
                return (
                  <label
                    key={service.id}
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
              })}
            </div>
          </div>
        </div>

        <div className="mt-auto flex w-full items-center justify-end gap-3 border-t border-secondary-2 px-6 py-4">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={mode === 'create' ? <img src={addIcon} alt="" className="size-5 invert" /> : undefined}
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
