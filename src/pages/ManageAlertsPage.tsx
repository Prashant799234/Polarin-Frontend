import { useMemo, useState } from 'react';
import type { AlertRule } from '../types';
import { initialAlerts } from '../data/mockAlerts';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Tabs, { type TabKey } from '../components/Tabs';
import AlertsTable from '../components/AlertsTable';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import AlertDetailsDrawer from '../components/AlertDetailsDrawer';
import AlertFormDrawer from '../components/AlertFormDrawer';
import DeleteModal from '../components/DeleteModal';
import ToastStack from '../components/ToastStack';
import { useToasts } from '../hooks/useToasts';
import verifiedUser from '../assets/icons/verified-user.svg';
import addIcon from '../assets/icons/add.svg';
import searchIcon from '../assets/icons/search.svg';
import keyboardArrowDown from '../assets/icons/keyboard-arrow-down.svg';
import Button from '../components/Button';

const PAGE_SIZE = 8;

function nextId(existing: AlertRule[]) {
  const max = existing.reduce((acc, r) => {
    const n = Number(r.id.replace('ar-', ''));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `ar-${String(max + 1).padStart(3, '0')}`;
}

function formatNow() {
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}, ${hours}:${minutes} ${ampm}`;
}

export default function ManageAlertsPage() {
  const [alerts, setAlerts] = useState<AlertRule[]>(initialAlerts);
  const [tab, setTab] = useState<TabKey>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { toasts, push, remove } = useToasts();

  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; rule?: AlertRule } | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<AlertRule | null>(null);

  const counts = useMemo(
    () => ({
      active: alerts.filter((a) => a.status === 'active').length,
      normal: alerts.filter((a) => a.status === 'normal').length,
      all: alerts.length,
    }),
    [alerts],
  );

  const filtered = useMemo(() => {
    let list = alerts;
    if (tab !== 'all') list = list.filter((a) => a.status === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.ruleName.toLowerCase().includes(q) ||
          a.metric.toLowerCase().includes(q) ||
          a.services.some((s) => s.name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [alerts, tab, search]);

  const pageRules = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeTab = (key: TabKey) => {
    setTab(key);
    setPage(1);
  };

  const openCreate = () => setFormState({ mode: 'create' });
  const openEdit = (rule: AlertRule) => {
    setSelectedRule(null);
    setFormState({ mode: 'edit', rule });
  };

  const handleSave = (data: Omit<AlertRule, 'id' | 'status' | 'activeAlertCount' | 'timestamp'>) => {
    if (formState?.mode === 'edit' && formState.rule) {
      setAlerts((prev) => prev.map((a) => (a.id === formState.rule!.id ? { ...a, ...data } : a)));
      push(`${data.ruleName} updated successfully`);
    } else {
      const newRule: AlertRule = {
        ...data,
        id: nextId(alerts),
        status: 'active',
        activeAlertCount: 0,
        timestamp: formatNow(),
      };
      setAlerts((prev) => [newRule, ...prev]);
      setTab('active');
      setPage(1);
      push(`${data.ruleName} created successfully`);
    }
    setFormState(null);
  };

  const handleDeleteConfirm = () => {
    if (!ruleToDelete) return;
    setAlerts((prev) => prev.filter((a) => a.id !== ruleToDelete.id));
    push(`${ruleToDelete.ruleName} deleted`, 'error');
    setRuleToDelete(null);
    setSelectedRule(null);
  };

  const updateServices = (services: AlertRule['services']) => {
    if (!selectedRule) return;
    setAlerts((prev) => prev.map((a) => (a.id === selectedRule.id ? { ...a, services } : a)));
    setSelectedRule((prev) => (prev ? { ...prev, services } : prev));
  };

  const emptyCopy: Record<TabKey, { title: string; description: string }> = {
    active: {
      title: 'No active alerts',
      description: 'Everything is running within normal thresholds right now. New breaches will show up here.',
    },
    normal: {
      title: 'No alerts have returned to normal yet',
      description: 'Once an active alert clears, it will show up here with its resolution details.',
    },
    all: {
      title: 'No alert rules yet',
      description: 'Create your first alert rule to start monitoring services for threshold breaches.',
    },
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary-1">
      <Header />
      <div className="flex flex-1 items-start justify-between">
        <Sidebar />
        <div className="flex flex-1 items-start p-4 pt-4">
          <div className="flex w-full flex-1 flex-col items-start gap-6 rounded-2xl bg-white p-6 shadow-card">
            <div className="flex w-full items-center gap-4">
              <div className="flex items-center justify-center rounded-full bg-primary-2 p-4">
                <img src={verifiedUser} alt="" className="size-10" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h1 className="font-lato text-2xl font-extrabold text-secondary-7">Manage Alert Rules</h1>
                <p className="text-secondary-6">Create, edit, duplicate or disable rules</p>
              </div>
              <Button variant="secondary" icon={<img src={addIcon} alt="" className="size-5" />} onClick={openCreate}>
                Create Alert
              </Button>
            </div>

            <Tabs counts={counts} value={tab} onChange={changeTab} />

            {filtered.length === 0 && !search ? (
              <EmptyState {...emptyCopy[tab]} onCreate={openCreate} />
            ) : (
              <div className="flex w-full flex-col items-start gap-3">
                <div className="flex w-full items-center justify-between">
                  <div className="flex max-w-[380px] flex-1 items-center gap-2 rounded-xl border border-secondary-3 py-2 pl-4 pr-2 transition-colors duration-150 focus-within:border-primary-4 hover:border-secondary-4">
                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by Alert Name, metrics, or service name"
                      className="flex-1 bg-transparent text-sm text-secondary-7 outline-none placeholder:text-secondary-6"
                    />
                    <img src={searchIcon} alt="" className="size-6" />
                  </div>
                  <button
                    type="button"
                    className="flex w-[150px] items-center gap-1 rounded-xl border border-secondary-3 py-2 pl-4 pr-2 transition-colors duration-150 hover:border-secondary-4 hover:bg-secondary-1"
                  >
                    <span className="flex-1 text-left text-sm font-bold text-secondary-7">Last 1 Month</span>
                    <img src={keyboardArrowDown} alt="" className="size-6" />
                  </button>
                </div>

                {pageRules.length === 0 ? (
                  <div className="flex w-full flex-col items-center gap-2 py-16 text-center text-sm text-secondary-6">
                    No alert rules match &ldquo;{search}&rdquo;.
                  </div>
                ) : (
                  <AlertsTable
                    rules={pageRules}
                    onRowClick={setSelectedRule}
                    onEdit={openEdit}
                    onDelete={setRuleToDelete}
                  />
                )}

                {pageRules.length > 0 && (
                  <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRule && !formState && (
        <AlertDetailsDrawer
          rule={selectedRule}
          onClose={() => setSelectedRule(null)}
          onEdit={() => openEdit(selectedRule)}
          onDelete={() => setRuleToDelete(selectedRule)}
          onUpdateServices={updateServices}
          onToast={push}
        />
      )}

      {formState && (
        <AlertFormDrawer
          mode={formState.mode}
          initial={formState.rule}
          onClose={() => setFormState(null)}
          onSave={handleSave}
        />
      )}

      {ruleToDelete && (
        <DeleteModal rule={ruleToDelete} onClose={() => setRuleToDelete(null)} onConfirm={handleDeleteConfirm} />
      )}

      <ToastStack toasts={toasts} onDone={remove} />
    </div>
  );
}
