import { useState } from 'react';
import type { AlertRule } from '../types';
import SeverityBadge from './Badge';
import Button from './Button';
import closeIcon from '../assets/icons/close.svg';
import editIcon from '../assets/icons/edit.svg';
import deleteIcon from '../assets/icons/delete.svg';
import deleteSmall from '../assets/icons/delete-small.svg';
import moreVert from '../assets/icons/more-vert.svg';
import searchIcon from '../assets/icons/search.svg';
import keyboardArrowDown from '../assets/icons/keyboard-arrow-down.svg';
import addIcon from '../assets/icons/add.svg';
import serviceDot from '../assets/icons/service-dot.svg';
import { serviceCatalog } from '../data/mockAlerts';

interface Props {
  rule: AlertRule;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateServices: (services: AlertRule['services']) => void;
}

export default function AlertDetailsDrawer({ rule, onClose, onEdit, onDelete, onUpdateServices }: Props) {
  const [tab, setTab] = useState<'services' | 'history'>('services');
  const [showPicker, setShowPicker] = useState(false);

  const availableToAdd = serviceCatalog.filter((c) => !rule.services.some((s) => s.name === c.name));

  const removeService = (id: string) => {
    onUpdateServices(rule.services.filter((s) => s.id !== id));
  };

  const addService = (catalogItem: (typeof serviceCatalog)[number]) => {
    onUpdateServices([
      ...rule.services,
      { id: `${catalogItem.id}-${Date.now()}`, name: catalogItem.name, activeAlerts: 0, capacity: catalogItem.capacity },
    ]);
    setShowPicker(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/80" onClick={onClose}>
      <div
        className="flex h-full w-[800px] max-w-[95vw] flex-col items-start overflow-y-auto bg-white py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex w-full flex-col items-start gap-6 px-6">
          <div className="flex w-full flex-col items-start justify-center gap-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start justify-end">
                <div className="flex items-end gap-2">
                  <p className="font-inter text-xl font-extrabold text-secondary-7">{rule.ruleName}</p>
                  <SeverityBadge severity={rule.severity} />
                </div>
                <p className="w-[336px] text-sm text-secondary-6">
                  {rule.aggregation} {rule.metric} {rule.comparator} {rule.threshold}
                </p>
              </div>
              <Button variant="secondary" icon={<img src={closeIcon} alt="" className="size-5" />} onClick={onClose}>
                Close
              </Button>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="secondary" icon={<img src={editIcon} alt="" className="size-5" />} onClick={onEdit}>
                  Edit Rule
                </Button>
                <Button variant="secondary" icon={<img src={deleteIcon} alt="" className="size-5" />} onClick={onDelete}>
                  Delete
                </Button>
              </div>
              <img src={moreVert} alt="" className="size-6" />
            </div>
          </div>
        </div>

        <div className="flex w-full items-center gap-0.5 border-y-[0.5px] border-secondary-2 bg-secondary-1 px-6 py-1 shadow-[0px_0.5px_2px_0px_rgba(96,97,112,0.16)]">
          {(['services', 'history'] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1 overflow-clip rounded-[10px] px-3 py-2 ${
                tab === key ? 'bg-white shadow-[0px_2px_4px_0px_rgba(58,58,58,0.08),0px_4px_6px_0px_rgba(58,58,58,0.06)]' : ''
              }`}
            >
              <span className={`text-sm font-bold ${tab === key ? 'text-secondary-7' : 'text-secondary-6'}`}>
                {key === 'services' ? 'Services' : 'Alert History'}
              </span>
              <span className="inline-flex items-center justify-center rounded-lg border border-secondary-3 bg-secondary-2 px-2 py-0.5 text-[10px] font-bold text-secondary-7">
                {key === 'services' ? rule.services.length : 0}
              </span>
            </button>
          ))}
        </div>

        {tab === 'services' ? (
          <div className="flex w-full flex-col items-start gap-4 px-6 pt-6">
            <div className="flex w-full flex-col items-start">
              <p className="font-lato text-base font-extrabold text-secondary-7">Services this alert watches</p>
              <p className="text-sm text-secondary-6">
                You can add or remove individual services on this alert at any time. Only active alerts show
                inline - closed ones link into the full history.
              </p>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex max-w-[380px] flex-1 items-center gap-2 rounded-xl border border-secondary-3 py-2 pl-4 pr-2">
                <span className="flex-1 text-sm text-secondary-6">Search by Alert Name, metrics, or service name</span>
                <img src={searchIcon} alt="" className="size-6" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex w-[150px] items-center gap-1 rounded-xl border border-secondary-3 py-2 pl-4 pr-2">
                  <span className="flex-1 text-sm font-bold text-secondary-7">Last 1 Month</span>
                  <img src={keyboardArrowDown} alt="" className="size-6" />
                </div>
                <div className="relative">
                  <Button variant="secondary" icon={<img src={addIcon} alt="" className="size-5" />} onClick={() => setShowPicker((v) => !v)}>
                    Add Services
                  </Button>
                  {showPicker && (
                    <div className="absolute right-0 z-10 mt-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-secondary-3 bg-white p-2 shadow-card">
                      {availableToAdd.length === 0 ? (
                        <p className="p-2 text-xs text-secondary-6">All catalog services already added.</p>
                      ) : (
                        availableToAdd.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => addService(item)}
                            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-secondary-1"
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
            </div>

            <div className="flex w-full flex-col gap-2">
              {rule.services.map((service) => (
                <div key={service.id} className="flex w-full items-center gap-6 rounded-2xl border border-secondary-2 p-6">
                  <div className="flex flex-1 items-center gap-2">
                    <img src={serviceDot} alt="" className="size-4" />
                    <p className="flex-1 truncate text-sm font-bold text-secondary-7">{service.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-3xl border border-secondary-3 bg-secondary-1 px-2 py-1 text-[10px] text-secondary-6">
                      {service.activeAlerts > 0 ? `${service.activeAlerts} Active alerts` : 'No alerts yet'}
                    </span>
                    <span className="inline-flex items-center justify-center rounded-3xl border border-secondary-3 bg-secondary-1 px-2 py-1 font-mono text-[10px] text-secondary-7">
                      {service.capacity}
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${service.name}`}
                    onClick={() => removeService(service.id)}
                    className="flex items-center gap-1 rounded-xl border border-secondary-3 bg-white p-2"
                  >
                    <img src={deleteSmall} alt="" className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-1 items-center justify-center px-6 py-16 text-sm text-secondary-6">
            No alert history recorded for this rule yet.
          </div>
        )}
      </div>
    </div>
  );
}
