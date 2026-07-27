interface SidebarGroup {
  label: string;
  items: { label: string; active?: boolean }[];
}

const GROUPS: SidebarGroup[] = [
  {
    label: 'Organisation',
    items: [
      { label: 'Organisation Details' },
      { label: 'User Management' },
      { label: 'Billing Profile' },
      { label: 'Activity Logs' },
    ],
  },
  {
    label: 'Alerts',
    items: [{ label: 'Manage Alerts', active: true }],
  },
  {
    label: 'Reports',
    items: [{ label: 'Ports' }, { label: 'Virtual Connection' }, { label: 'DCI Wave' }],
  },
  {
    label: 'Personal',
    items: [{ label: 'Profile' }],
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-[180px] shrink-0 flex-col items-center gap-6 py-6">
      {GROUPS.map((group) => (
        <div key={group.label} className="flex w-full flex-col items-start gap-3 pr-6">
          <div className="flex w-full items-center pl-6 pr-4">
            <p className="text-xs uppercase text-secondary-6">{group.label}</p>
          </div>
          <div className="flex w-full flex-col items-start gap-0.5">
            {group.items.map((item) => (
              <div
                key={item.label}
                className={`flex w-full items-center rounded-r-2xl py-2 pl-6 pr-4 ${
                  item.active ? 'bg-white shadow-[0px_1px_1px_0px_rgba(58,58,58,0.05)]' : ''
                }`}
              >
                <p
                  className={`flex-1 text-sm font-bold ${item.active ? 'text-primary-5' : 'text-secondary-7'}`}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
