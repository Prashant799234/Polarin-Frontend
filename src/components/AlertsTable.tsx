import type { AlertRule } from '../types';
import SeverityBadge from './Badge';
import { ConditionPill, EventTypeCell } from './ConditionPill';
import editIcon from '../assets/icons/edit.svg';
import deleteIcon from '../assets/icons/delete.svg';
import swapVert from '../assets/icons/swap-vert.svg';
import filterAlt from '../assets/icons/filter-alt.svg';

const HEADERS = [
  { label: 'Rule Name', icon: swapVert },
  { label: 'Services', icon: filterAlt },
  { label: 'Condition', icon: swapVert },
  { label: 'Event Type', icon: filterAlt },
  { label: 'Timestamp', icon: filterAlt },
];

interface Props {
  rules: AlertRule[];
  onRowClick: (rule: AlertRule) => void;
  onEdit: (rule: AlertRule) => void;
  onDelete: (rule: AlertRule) => void;
}

export default function AlertsTable({ rules, onRowClick, onEdit, onDelete }: Props) {
  return (
    <div className="flex w-full flex-col items-start overflow-clip rounded-2xl border-[0.5px] border-secondary-2 bg-white shadow-table">
      <div className="flex h-[54px] w-full items-stretch border-b-2 border-secondary-6 bg-secondary-1">
        {HEADERS.map((h) => (
          <div key={h.label} className="flex flex-1 items-center gap-1 px-2 py-4 first:pl-6">
            <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">{h.label}</p>
            <img src={h.icon} alt="" className="size-4" />
          </div>
        ))}
        <div className="flex w-[88px] shrink-0 items-center justify-end gap-1 px-2 pl-2 pr-6 py-4">
          <p className="whitespace-nowrap text-sm font-semibold text-secondary-6">Actions</p>
        </div>
      </div>

      {rules.map((rule) => (
        <div
          key={rule.id}
          onClick={() => onRowClick(rule)}
          className="flex w-full cursor-pointer items-start border-b border-secondary-2 transition-colors duration-150 last:border-b-0 hover:bg-secondary-1 active:bg-secondary-2/60"
        >
          <div className="flex flex-1 flex-col gap-1 self-stretch overflow-clip py-4 pl-6 pr-2">
            <p className="truncate text-sm font-bold text-secondary-7">{rule.ruleName}</p>
            <SeverityBadge severity={rule.severity} className="w-fit" />
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
            <EventTypeCell eventType={rule.eventType} />
          </div>
          <div className="flex flex-1 flex-col items-start justify-center self-stretch overflow-clip px-2 py-4">
            <p className="w-full text-sm text-secondary-7">{rule.timestamp}</p>
          </div>
          <div className="flex h-[76px] w-[88px] shrink-0 items-center justify-end gap-1 overflow-clip py-3.5 pl-2 pr-6">
            <button
              type="button"
              aria-label="Edit rule"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(rule);
              }}
              className="rounded-full p-1 transition-all duration-150 hover:bg-secondary-2 active:scale-90"
            >
              <img src={editIcon} alt="" className="size-[18px]" />
            </button>
            <button
              type="button"
              aria-label="Delete rule"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(rule);
              }}
              className="rounded-full p-1 transition-all duration-150 hover:bg-red-2 active:scale-90"
            >
              <img src={deleteIcon} alt="" className="size-[18px]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
