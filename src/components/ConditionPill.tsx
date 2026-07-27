import type { AlertRule } from '../types';
import warningIcon from '../assets/icons/warning.svg';

export function ConditionPill({ rule }: { rule: AlertRule }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex w-fit rounded-3xl border border-secondary-3 bg-secondary-1 px-2 py-1 font-mono text-[10px] text-secondary-7">
        {rule.aggregation} {rule.metric} {rule.comparator} {rule.threshold}
      </span>
      {rule.status === 'active' ? (
        <ul className="list-disc pl-[18px] text-xs text-red-5">
          <li className="leading-4">{rule.activeAlertCount} Active alerts</li>
        </ul>
      ) : (
        <span className="pl-[2px] text-xs text-secondary-6">No active alerts</span>
      )}
    </div>
  );
}

export function EventTypeCell({ eventType }: { eventType: string }) {
  return (
    <div className="flex items-center gap-1">
      <img src={warningIcon} alt="" className="size-4" />
      <span className="text-sm text-secondary-7">{eventType}</span>
    </div>
  );
}
