import type { AlertRule } from '../types';
import { metricByKey } from '../data/catalog';
import { activeCountFor, conditionText, ruleStatus } from '../utils/rules';
import Icon from './Icon';

export function ConditionPill({ rule }: { rule: AlertRule }) {
  const active = activeCountFor(rule);
  return (
    <div className="flex flex-col gap-1">
      <span className="inline-flex w-fit rounded-3xl border border-secondary-3 bg-secondary-1 px-2 py-1 font-mono text-[10px] text-secondary-7">
        {conditionText(rule)}
      </span>
      {ruleStatus(rule) === 'active' ? (
        <ul className="list-disc pl-[18px] text-xs text-red-5">
          <li className="leading-4">{active} Active alert{active > 1 ? 's' : ''}</li>
        </ul>
      ) : (
        <span className="pl-[2px] text-xs text-secondary-6">No active alerts</span>
      )}
    </div>
  );
}

export function EventTypeCell({ metricKey }: { metricKey: string }) {
  const metric = metricByKey(metricKey);
  return (
    <div className="flex items-center gap-1">
      <Icon name="warning" size={16} className="text-secondary-6" />
      <span className="text-sm text-secondary-7">{metric.label}</span>
    </div>
  );
}
