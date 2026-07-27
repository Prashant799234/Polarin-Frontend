import { useMemo, useState } from 'react';
import type { AlertRule } from '../types';
import { initialAlerts } from '../data/mockAlerts';
import { metricByKey } from '../data/catalog';
import { ruleStatus, latestTimestamp } from '../utils/rules';
import { isWithinRange, nowIso, type TimeRange } from '../utils/dates';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Tabs, { type TabKey } from '../components/Tabs';
import AlertsTable, { type SortDir, type SortKey } from '../components/AlertsTable';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import AlertDetailsDrawer from '../components/AlertDetailsDrawer';
import AlertFormDrawer from '../components/AlertFormDrawer';
import DeleteModal from '../components/DeleteModal';
import ToastStack from '../components/ToastStack';
import TimeRangeDropdown from '../components/TimeRangeDropdown';
import { useToasts } from '../hooks/useToasts';
import Icon from '../components/Icon';
import Button from '../components/Button';

const PAGE_SIZE = 8;

function nextId(existing: AlertRule[]) {
  const max = existing.reduce((acc, r) => {
    const n = Number(r.id.replace('ar-', ''));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `ar-${String(max + 1).padStart(3, '0')}`;
}

export default function ManageAlertsPage() {
  const [alerts, setAlerts] = useState<AlertRule[]>(initialAlerts);
  const [tab, setTab] = useState<TabKey>('active');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeRange>({ key: '30d' });
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [serviceFilter, setServiceFilter] = useState<string[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);
  const { toasts, push, remove } = useToasts();

  const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);
  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; rule?: AlertRule } | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<AlertRule | null>(null);

  const counts = useMemo(
    () => ({
      active: alerts.filter((a) => ruleStatus(a) === 'active').length,
      normal: alerts.filter((a) => ruleStatus(a) === 'normal').length,
      all: alerts.length,
    }),
    [alerts],
  );

  const afterTabSearch = useMemo(() => {
    let list = alerts;
    if (tab !== 'all') list = list.filter((a) => ruleStatus(a) === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.ruleName.toLowerCase().includes(q) ||
          metricByKey(a.metricKey).label.toLowerCase().includes(q) ||
          a.services.some((s) => s.name.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [alerts, tab, search]);

  const serviceOptions = useMemo(
    () => [...new Set(afterTabSearch.flatMap((r) => r.services.map((s) => s.name)))].sort(),
    [afterTabSearch],
  );
  const eventTypeOptions = useMemo(
    () => [...new Set(afterTabSearch.map((r) => metricByKey(r.metricKey).label))].sort(),
    [afterTabSearch],
  );

  const filtered = useMemo(() => {
    let list = afterTabSearch;
    if (serviceFilter.length) list = list.filter((r) => r.services.some((s) => serviceFilter.includes(s.name)));
    if (eventTypeFilter.length) list = list.filter((r) => eventTypeFilter.includes(metricByKey(r.metricKey).label));
    list = list.filter((r) => isWithinRange(latestTimestamp(r), timeRange));

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.ruleName.localeCompare(b.ruleName);
      else if (sortKey === 'condition') cmp = (parseFloat(a.threshold) || 0) - (parseFloat(b.threshold) || 0);
      else cmp = new Date(latestTimestamp(a)).getTime() - new Date(latestTimestamp(b)).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [afterTabSearch, serviceFilter, eventTypeFilter, timeRange, sortKey, sortDir]);

  const pageRules = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filtersActive =
    search.trim().length > 0 || serviceFilter.length > 0 || eventTypeFilter.length > 0 || timeRange.key !== '30d';

  const clearFilters = () => {
    setSearch('');
    setServiceFilter([]);
    setEventTypeFilter([]);
    setTimeRange({ key: '30d' });
    setPage(1);
  };

  const changeTab = (key: TabKey) => {
    setTab(key);
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openCreate = () => setFormState({ mode: 'create' });
  const openEdit = (rule: AlertRule) => {
    setSelectedRule(null);
    setFormState({ mode: 'edit', rule });
  };

  const handleSave = (data: Omit<AlertRule, 'id' | 'history' | 'createdAt'>) => {
    if (formState?.mode === 'edit' && formState.rule) {
      setAlerts((prev) => prev.map((a) => (a.id === formState.rule!.id ? { ...a, ...data } : a)));
      push(`${data.ruleName} updated successfully`);
    } else {
      const newRule: AlertRule = { ...data, id: nextId(alerts), history: [], createdAt: nowIso() };
      setAlerts((prev) => [newRule, ...prev]);
      setTab('all');
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
                <Icon name="verified_user" size={40} className="text-primary-5" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h1 className="font-lato text-2xl font-extrabold text-secondary-7">Manage Alert Rules</h1>
                <p className="text-secondary-6">Create, edit, duplicate or disable rules</p>
              </div>
              <Button variant="secondary" icon={<Icon name="add" size={20} />} onClick={openCreate}>
                Create Alert
              </Button>
            </div>

            <Tabs counts={counts} value={tab} onChange={changeTab} />

            {afterTabSearch.length === 0 && !filtersActive ? (
              <EmptyState {...emptyCopy[tab]} onCreate={openCreate} />
            ) : (
              <div className="flex w-full flex-col items-start gap-3">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex max-w-[380px] flex-1 items-center gap-2 rounded-xl border border-secondary-3 py-2 pl-4 pr-2 transition-colors duration-150 hover:border-primary-4 focus-within:border-primary-5 focus-within:ring-4 focus-within:ring-primary-3/30">
                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search by Alert Name, metrics, or service name"
                        className="flex-1 bg-transparent text-sm text-secondary-7 outline-none placeholder:text-secondary-6"
                      />
                      <Icon name="search" size={20} className="text-secondary-6" />
                    </div>
                    {filtersActive && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="flex items-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-sm font-bold text-primary-5 transition-colors duration-150 hover:bg-primary-2"
                      >
                        <Icon name="close" size={16} />
                        Clear filters
                      </button>
                    )}
                  </div>
                  <TimeRangeDropdown value={timeRange} onChange={(r) => { setTimeRange(r); setPage(1); }} />
                </div>

                {pageRules.length === 0 ? (
                  <div className="flex w-full flex-col items-center gap-3 py-16 text-center text-sm text-secondary-6">
                    <p>No alert rules match your search or filters.</p>
                    <Button variant="secondary" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <AlertsTable
                    rules={pageRules}
                    onRowClick={setSelectedRule}
                    onEdit={openEdit}
                    onDelete={setRuleToDelete}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSortChange={handleSort}
                    serviceOptions={serviceOptions}
                    serviceFilter={serviceFilter}
                    onServiceFilterChange={(v) => {
                      setServiceFilter(v);
                      setPage(1);
                    }}
                    eventTypeOptions={eventTypeOptions}
                    eventTypeFilter={eventTypeFilter}
                    onEventTypeFilterChange={(v) => {
                      setEventTypeFilter(v);
                      setPage(1);
                    }}
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
