export type TabKey = 'active' | 'normal' | 'all';

const TAB_LABELS: Record<TabKey, string> = {
  active: 'Active',
  normal: 'Returned to Normal',
  all: 'All',
};

interface Props {
  counts: Record<TabKey, number>;
  value: TabKey;
  onChange: (key: TabKey) => void;
}

export default function Tabs({ counts, value, onChange }: Props) {
  const order: TabKey[] = ['active', 'normal', 'all'];
  return (
    <div className="flex items-center gap-2">
      {order.map((key) => {
        const selected = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex h-10 items-center gap-1 rounded-full border px-4 py-2 text-xs transition-all duration-150 active:scale-95 ${
              selected
                ? 'border-primary-5 bg-primary-5 text-secondary-1'
                : 'border-secondary-3 bg-white text-secondary-7 hover:border-secondary-4 hover:bg-secondary-1'
            }`}
          >
            <span>{TAB_LABELS[key]}</span>
            <span
              className={`inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-[10px] font-bold transition-colors duration-150 ${
                selected
                  ? 'border-primary-4 bg-primary-3 text-primary-6'
                  : 'border-secondary-3 bg-secondary-2 text-secondary-7'
              }`}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
