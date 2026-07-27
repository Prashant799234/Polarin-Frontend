import { useEffect, useRef, useState } from 'react';
import type { AlertRule } from '../types';
import SeverityBadge from './Badge';
import { ConditionPill, EventTypeCell } from './ConditionPill';
import Icon from './Icon';
import Tooltip from './Tooltip';
import { latestTimestamp } from '../utils/rules';
import { formatDateTime } from '../utils/dates';

export type SortKey = 'name' | 'condition' | 'timestamp';
export type SortDir = 'asc' | 'desc';

interface FilterPopoverProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

function FilterPopover({ label, options, selected, onChange }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  };

  return (
    <div className="relative" ref={ref}>
      <Tooltip label={`Filter by ${label}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="relative flex items-center justify-center rounded p-0.5 transition-colors duration-150 hover:bg-secondary-2 active:scale-90"
        >
          <Icon name="filter_alt" size={16} className={selected.length ? 'text-primary-5' : 'text-secondary-6'} />
          {selected.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-primary-5" />
          )}
        </button>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-56 origin-top-left animate-[dropdown-in_150ms_ease-out] rounded-xl border border-secondary-3 bg-white p-2 shadow-card">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-bold uppercase text-secondary-6">{label}</span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-bold text-primary-5 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-secondary-7 transition-colors duration-150 hover:bg-secondary-1"
              >
                <input
                  type="checkbox"
                  className="accent-primary-4"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  rules: AlertRule[];
  onRowClick: (rule: AlertRule) => void;
  onEdit: (rule: AlertRule) => void;
  onDelete: (rule: AlertRule) => void;
  onDuplicate: (rule: AlertRule) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey) => void;
  serviceOptions: string[];
  serviceFilter: string[];
  onServiceFilterChange: (v: string[]) => void;
  eventTypeOptions: string[];
  eventTypeFilter: string[];
  onEventTypeFilterChange: (v: string[]) => void;
}

function SortIcon({ active, dir, onClick, label }: { active: boolean; dir: SortDir; onClick: () => void; label: string }) {
  return (
    <Tooltip label={`Sort by ${label}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="flex items-center justify-center rounded p-0.5 transition-colors duration-150 hover:bg-secondary-2 active:scale-90"
      >
        <Icon
          name="swap_vert"
          size={16}
          className={`${active ? 'text-primary-5' : 'text-secondary-6'} ${active && dir === 'asc' ? 'scale-y-[-1]' : ''}`}
        />
      </button>
    </Tooltip>
  );
}

export default function AlertsTable({
  rules,
  onRowClick,
  onEdit,
  onDelete,
  onDuplicate,
  sortKey,
  sortDir,
  onSortChange,
  serviceOptions,
  serviceFilter,
  onServiceFilterChange,
  eventTypeOptions,
  eventTypeFilter,
  onEventTypeFilterChange,
}: Props) {
  return (
    <div className="flex w-full flex-col items-start overflow-visible rounded-2xl border-[0.5px] border-secondary-2 bg-white shadow-table">
      <div className="flex h-[54px] w-full items-stretch overflow-visible rounded-t-2xl bg-secondary-1">
        <div className="flex flex-1 items-center gap-1 px-2 py-4 pl-6">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Rule Name</p>
          <SortIcon active={sortKey === 'name'} dir={sortDir} onClick={() => onSortChange('name')} label="Rule Name" />
        </div>
        <div className="flex flex-1 items-center gap-1 px-2 py-4">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Services</p>
          <FilterPopover
            label="Services"
            options={serviceOptions}
            selected={serviceFilter}
            onChange={onServiceFilterChange}
          />
        </div>
        <div className="flex flex-1 items-center gap-1 px-2 py-4">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Condition</p>
          <SortIcon active={sortKey === 'condition'} dir={sortDir} onClick={() => onSortChange('condition')} label="Condition" />
        </div>
        <div className="flex flex-1 items-center gap-1 px-2 py-4">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Event Type</p>
          <FilterPopover
            label="Event Type"
            options={eventTypeOptions}
            selected={eventTypeFilter}
            onChange={onEventTypeFilterChange}
          />
        </div>
        <div className="flex flex-1 items-center gap-1 px-2 py-4">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Timestamp</p>
          <SortIcon active={sortKey === 'timestamp'} dir={sortDir} onClick={() => onSortChange('timestamp')} label="Timestamp" />
        </div>
        <div className="flex w-[132px] shrink-0 items-center justify-end gap-1 px-2 pl-2 pr-6 py-4">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Actions</p>
        </div>
      </div>

      {rules.map((rule) => (
        <div
          key={rule.id}
          onClick={() => onRowClick(rule)}
          className={`flex w-full cursor-pointer items-start border-b border-secondary-2 transition-colors duration-150 last:border-b-0 hover:bg-secondary-1 active:bg-secondary-2/60 ${
            rule.enabled ? '' : 'opacity-60'
          }`}
        >
          <div className="flex flex-1 flex-col gap-1 self-stretch overflow-clip py-4 pl-6 pr-2">
            <p className="truncate text-sm font-bold text-secondary-7">{rule.ruleName}</p>
            <div className="flex flex-wrap items-center gap-1">
              <SeverityBadge severity={rule.severity} className="w-fit" />
              {!rule.enabled && (
                <span className="inline-flex w-fit items-center rounded-3xl border border-secondary-3 bg-secondary-2 px-2 py-1 text-[10px] text-secondary-7">
                  Disabled
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col items-start justify-center self-stretch overflow-clip px-2 py-4">
            <div className="flex items-center gap-1 whitespace-nowrap">
              <p className="truncate text-sm font-bold text-secondary-7">{rule.services[0]?.name}</p>
              {rule.services.length > 1 && (
                <p className="text-[10px] text-secondary-6">+{rule.services.length - 1} more</p>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col items-start gap-1 self-stretch overflow-clip px-2 py-4">
            <ConditionPill rule={rule} />
          </div>
          <div className="flex flex-1 items-center gap-1 self-stretch overflow-clip px-2 py-4">
            <EventTypeCell metricKey={rule.metricKey} />
          </div>
          <div className="flex flex-1 flex-col items-start justify-center self-stretch overflow-clip px-2 py-4">
            <p className="w-full text-sm text-secondary-7">{formatDateTime(latestTimestamp(rule))}</p>
          </div>
          <div className="flex h-[76px] w-[132px] shrink-0 items-center justify-end gap-1 py-3.5 pl-2 pr-6">
            <Tooltip label="Edit rule">
              <button
                type="button"
                aria-label="Edit rule"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(rule);
                }}
                className="flex items-center justify-center rounded-full p-1.5 transition-all duration-150 hover:bg-secondary-2 active:scale-90"
              >
                <Icon name="edit" size={18} className="text-secondary-7" />
              </button>
            </Tooltip>
            <Tooltip label="Duplicate rule">
              <button
                type="button"
                aria-label="Duplicate rule"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(rule);
                }}
                className="flex items-center justify-center rounded-full p-1.5 transition-all duration-150 hover:bg-secondary-2 active:scale-90"
              >
                <Icon name="content_copy" size={18} className="text-secondary-7" />
              </button>
            </Tooltip>
            <Tooltip label="Delete rule">
              <button
                type="button"
                aria-label="Delete rule"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(rule);
                }}
                className="flex items-center justify-center rounded-full p-1.5 transition-all duration-150 hover:bg-red-2 active:scale-90"
              >
                <Icon name="delete" size={18} className="text-secondary-7" />
              </button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
}
