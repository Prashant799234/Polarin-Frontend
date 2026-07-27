import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import Button from './Button';
import { TIME_RANGE_LABELS, type TimeRange, type TimeRangeKey } from '../utils/dates';

const ORDER: TimeRangeKey[] = ['7d', '30d', '90d', 'all', 'custom'];

export default function TimeRangeDropdown({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.from ?? '');
  const [to, setTo] = useState(value.to ?? '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const label = value.key === 'custom' && value.from && value.to
    ? `${value.from} → ${value.to}`
    : TIME_RANGE_LABELS[value.key];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-[190px] items-center gap-1 rounded-xl border border-secondary-3 py-2 pl-4 pr-2 transition-colors duration-150 hover:border-secondary-4 hover:bg-secondary-1"
      >
        <span className="flex-1 truncate text-left text-sm font-bold text-secondary-7">{label}</span>
        <Icon name="keyboard_arrow_down" size={20} className="text-secondary-6" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-64 origin-top-right animate-[dropdown-in_150ms_ease-out] rounded-xl border border-secondary-3 bg-white p-2 shadow-card">
          {ORDER.filter((k) => k !== 'custom').map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                onChange({ key: k });
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors duration-150 hover:bg-secondary-1 ${
                value.key === k ? 'text-primary-5' : 'text-secondary-7'
              }`}
            >
              {TIME_RANGE_LABELS[k]}
              {value.key === k && <Icon name="check" size={16} />}
            </button>
          ))}
          <div className="mt-1 border-t border-secondary-2 pt-2">
            <p className="px-3 pb-1 text-xs font-bold uppercase text-secondary-6">Custom Range</p>
            <div className="flex flex-col gap-2 px-3 pb-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-secondary-3 px-2 py-1.5 text-sm text-secondary-7 outline-none transition-colors duration-150 hover:border-secondary-4 focus:border-primary-4"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-secondary-3 px-2 py-1.5 text-sm text-secondary-7 outline-none transition-colors duration-150 hover:border-secondary-4 focus:border-primary-4"
              />
              <Button
                variant="primary"
                disabled={!from || !to}
                className="w-full justify-center"
                onClick={() => {
                  onChange({ key: 'custom', from, to });
                  setOpen(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
