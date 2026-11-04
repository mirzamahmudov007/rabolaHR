'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BuildingIcon, CctvIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { branches as seedBranches } from '@/shared/data/branches';
import { employees } from '@/shared/data/employees';
import { devices as seedDevices } from '@/features/devices/data/devices';
import { statusOrder, statusMeta } from '@/shared/data/attendanceStatuses';
import { Tabs } from '@/shared/ui/Tabs';
import { Button } from '@/shared/ui/Button';
import { TextInput } from '@/shared/form/TextInput';
import { useGloss } from '@/shared/i18n/format';
import { AddBranchModal } from './components/AddBranchModal';
import type { AttendanceStatus, Branch } from '@/shared/types/employee';

interface BranchStats {
  people: number;
  byStatus: Record<AttendanceStatus, number>;
  devicesTotal: number;
  devicesOnline: number;
}

export function Branches() {
  const t = useTranslations('branchPage');
  const td = useTranslations('data');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const [list, setList] = useState<Branch[]>(seedBranches);
  const [adding, setAdding] = useState(false);

  const regions = useMemo(() => Array.from(new Set(list.map((b) => b.region))), [list]);

  const stats = useMemo(() => {
    const map: Record<string, BranchStats> = {};
    list.forEach((b) => {
      map[b.name] = {
        people: 0,
        byStatus: { present: 0, late: 0, absent: 0, leave: 0 },
        devicesTotal: 0,
        devicesOnline: 0
      };
    });
    employees.forEach((e) => {
      const s = map[e.branch];
      if (s) {s.people += 1;s.byStatus[e.status] += 1;}
    });
    seedDevices.forEach((d) => {
      const s = map[d.branch];
      if (s) {s.devicesTotal += 1;if (d.status === 'online') s.devicesOnline += 1;}
    });
    return map;
  }, [list]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (b) =>
      (region === 'all' || b.region === region) && (!q || b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q) || g(b.name).toLowerCase().includes(q) || g(b.region).toLowerCase().includes(q)));

  }, [list, region, query, g]);

  const create = (branch: Branch) => {
    setList((l) => [...l, branch]);
    setAdding(false);
    toast.success(t('added', { name: g(branch.name) }), {
      description: t('addedDesc')
    });
  };

  return (
    <div>
      <section className="rounded-xl border border-line bg-surface shadow-card" aria-label={t('listAria')}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-3">
          <Tabs
            label={t('listAria')}
            value={region}
            onChange={setRegion}
            items={[
            { key: 'all', label: tc('all'), count: list.length },
            ...regions.map((r) => ({
              key: r,
              label: g(r),
              count: list.filter((b) => b.region === r).length
            }))]
          } />

          <Button
            variant="brand"
            icon={<BuildingIcon className="h-4 w-4" aria-hidden />}
            onClick={() => setAdding(true)}>
            {t('add')}
          </Button>
        </div>
        <div className="p-4">
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPh')}
            aria-label={tc('search')}
            className="w-full sm:w-72"
            leading={<SearchIcon className="h-4 w-4" aria-hidden />} />

          
        </div>
      </section>

      {visible.length > 0 ?
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((b) => {
          const s = stats[b.name];
          return (
            <article
              key={b.id}
              className="rounded-xl border border-line bg-surface p-4 shadow-card">

              <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-ink">
                    <BuildingIcon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-ink">{g(b.name)}</h3>
                    <p className="mt-0.5 text-xs text-muted">{g(b.region)}</p>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-[13px]">
                  <div className="flex items-baseline gap-2">
                    <UsersIcon className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <dt className="text-muted">{t('employees')}</dt>
                    <dd className="ml-auto font-semibold tabular-nums text-ink">{s.people}</dd>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CctvIcon className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
                    <dt className="text-muted">{t('devices')}</dt>
                    <dd className="ml-auto font-semibold tabular-nums text-ink">
                      {s.devicesTotal > 0 ?
                      <>
                          {s.devicesTotal}
                          {s.devicesOnline > 0 &&
                        <span className="ml-1.5 text-xs font-medium text-present-ink">
                              {t('online', { count: s.devicesOnline })}
                            </span>
                        }
                        </> :

                      <span className="text-xs font-normal text-subtle">{t('noDevices')}</span>
                      }
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.people === 0 ?
                  <p className="text-xs text-subtle">{t('noEmployees')}</p> :

                  statusOrder.
                  filter((st) => s.byStatus[st] > 0).
                  map((st) =>
                    <span
                      key={st}
                      className={`rounded px-2 py-0.5 text-xs font-medium ${statusMeta[st].badgeClass}`}>

                        {td(`dayState.${st}`)} · <span className="tabular-nums">{s.byStatus[st]}</span>
                      </span>
                  )
                  }
                </div>
              </article>);

          })}
        </div> :

      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-14 text-center shadow-card">
          <p className="text-sm font-semibold text-ink">{t('emptyTitle')}</p>
          <p className="text-[13px] text-muted">{t('emptyDesc')}</p>
        </div>
      }

      <AddBranchModal
        open={adding}
        onClose={() => setAdding(false)}
        regions={regions}
        onCreate={create} />

    </div>);

}
