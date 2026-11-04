'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';
import { faceLogs } from '@/features/monitoring/data/faceLogs';
import { branches } from '@/shared/data/branches';
import { employees } from '@/shared/data/employees';
import { logEventMeta, logEventOrder } from '@/features/monitoring/data/logEvents';
import { useLiveLogs } from '@/features/monitoring/hooks/useLiveLogs';
import { LogFeed } from '@/features/monitoring/components/LogFeed';
import { LogDetail } from '@/features/monitoring/components/LogDetail';
import { LiveToggle } from '@/features/monitoring/components/LiveToggle';
import { BranchSwitcher } from '@/shared/components/BranchSwitcher';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Tabs } from '@/shared/ui/Tabs';
import { TextInput } from '@/shared/form/TextInput';
import { useGloss } from '@/shared/i18n/format';
import { TODAY } from '@/shared/utils/date';
import { useScreenInit } from '@/shared/lib/useScreenInit';
import type { LogEvent } from '@/features/monitoring/types/faceLog';

const nameById = new Map(employees.map((e) => [e.id, `${e.name} ${e.code}`.toLowerCase()]));

export function Monitoring() {
  const tm = useTranslations('monitoring');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [live, setLive] = useState(true);
  const { logs, freshId } = useLiveLogs(faceLogs, live);
  const screenInit = useScreenInit();
  const [tab, setTab] = useState<LogEvent | 'all'>(screenInit.tab ?? 'all');
  const [branch, setBranch] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<Date>(TODAY);
  const [selectedId, setSelectedId] = useState<string | null>(screenInit.selectedId ?? faceLogs[0]?.id ?? null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const scoped = useMemo(() => branch ? logs.filter((l) => l.branch === branch) : logs, [logs, branch]);

  const counts = useMemo(() => {
    const c: Record<LogEvent, number> = { in: 0, out: 0, unknown: 0 };
    scoped.forEach((l) => c[l.event] += 1);
    return c;
  }, [scoped]);

  const branchCounts = useMemo(() => {
    const c: Record<string, number> = {};
    logs.forEach((l) => c[l.branch] = (c[l.branch] ?? 0) + 1);
    return c;
  }, [logs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter(
      (l) =>
      (tab === 'all' || l.event === tab) && (
      !q ||
      l.camera.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) || (
      l.employeeId ? nameById.get(l.employeeId)?.includes(q) : tm('matchUnknown').includes(q)))
    );
  }, [scoped, tab, query, tm]);

  const selected = logs.find((l) => l.id === selectedId) ?? null;
  const history = selected?.employeeId ? logs.filter((l) => l.employeeId === selected.employeeId) : [];
  const pendingStrangers = scoped.filter((l) => l.event === 'unknown' && !reviewed.has(l.id)).length;

  const tabs: {key: LogEvent | 'all';label: string;count: number;}[] = [
  { key: 'all', label: tc('all'), count: scoped.length },
  ...logEventOrder.map((e) => ({ key: e, label: g(logEventMeta[e].tab), count: counts[e] }))];


  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-xl border border-line bg-surface shadow-card" aria-label={tm('feedAria')}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-3">
          <Tabs
            label={tm('eventsAria')}
            value={tab}
            onChange={(k) => setTab(k as LogEvent | 'all')}
            items={tabs.map((t) => ({ key: t.key, label: t.label, count: t.count, alert: t.key === 'unknown' && pendingStrangers > 0 }))} />
          
          <LiveToggle live={live} onToggle={() => setLive((v) => !v)} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <BranchSwitcher branches={branches} counts={branchCounts} total={logs.length} value={branch} onChange={setBranch} />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tm('searchPh')}
            aria-label={tc('search')}
            className="w-full sm:w-64"
            leading={<SearchIcon className="h-4 w-4" aria-hidden />} />
          
          <DatePicker value={date} onChange={setDate} />
        </div>

        <LogFeed logs={visible} selectedId={selectedId} freshId={freshId} reviewed={reviewed} onSelect={setSelectedId} />
      </section>

      <div className="xl:sticky xl:top-[88px]">
        <LogDetail
          log={selected}
          history={history}
          reviewed={selected ? reviewed.has(selected.id) : false}
          onReview={(id) => setReviewed((s) => new Set(s).add(id))} />
        
      </div>
    </div>);

}