'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { BuildingIcon, CheckIcon, ChevronsUpDownIcon, SearchIcon } from 'lucide-react';
import { useDismiss } from '@/shared/hooks/useDismiss';
import { useGloss } from '@/shared/i18n/format';
import type { Branch } from '@/shared/types/employee';

interface BranchSwitcherProps {
  branches: Branch[];
  counts: Record<string, number>;
  total: number;
  value: string | null;
  onChange: (branch: string | null) => void;
}

export function BranchSwitcher({ branches, counts, total, value, onChange }: BranchSwitcherProps) {
  const t = useTranslations('branches');
  const td = useTranslations('data.branch');
  const { g } = useGloss();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Branch[]>();
    // Search in the active language as well as in the stored Uzbek labels.
    branches.
    filter((b) => {
      if (!q) return true;
      return `${b.name} ${b.region} ${g(b.name)} ${g(b.region)}`.toLowerCase().includes(q);
    }).
    forEach((b) => map.set(b.region, [...(map.get(b.region) ?? []), b]));
    return Array.from(map.entries());
  }, [branches, query, g]);

  // Single-branch companies: no switcher needed, just show the scope.
  if (branches.length <= 1) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 text-sm font-semibold text-ink">
        <BuildingIcon className="h-4 w-4 text-muted" aria-hidden />
        {branches[0] ? g(branches[0].name) : t('none')}
      </div>);

  }

  const pick = (name: string | null) => {
    onChange(name);
    setOpen(false);
  };

  const row = (label: string, count: number, selected: boolean, onClick: () => void, sub?: string) =>
  <button
    onClick={onClick}
    role="option"
    aria-selected={selected}
    className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-100 hover:bg-canvas ${
    selected ? 'bg-canvas' : ''}`
    }>
    
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {selected && <CheckIcon className="h-4 w-4 text-ink" strokeWidth={2.5} aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[13px] ${selected ? 'font-semibold text-ink' : 'text-body'}`}>{label}</span>
        {sub && <span className="block text-[11px] text-subtle">{sub}</span>}
      </span>
      <span className={`text-xs tabular-nums ${count === 0 ? 'text-subtle' : 'text-muted'}`}>{count}</span>
    </button>;


  const resultCount = groups.reduce((s, [, list]) => s + list.length, 0);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex h-9 max-w-[240px] items-center gap-2 rounded-lg border px-3 text-sm font-medium text-ink transition-colors duration-150 ${
        open ? 'border-ink/40 bg-canvas' : 'border-line bg-surface hover:bg-canvas'}`
        }>
        
        <BuildingIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <span className="truncate">{value ? g(value) : td('all')}</span>
        <span className="rounded bg-brand-soft px-1.5 text-xs font-semibold tabular-nums text-muted">
          {value ? counts[value] ?? 0 : branches.length}
        </span>
        <ChevronsUpDownIcon className="h-3.5 w-3.5 shrink-0 text-subtle" aria-hidden />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 top-full z-40 mt-1.5 w-[300px] origin-top-left overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
          
            <div className="relative border-b border-line">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
              <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-ink outline-none placeholder:text-subtle" />
            
            </div>

            <div className="max-h-[340px] overflow-y-auto p-1.5" role="listbox" aria-label={t('listAria')}>
              {!query &&
            <>
                  {row(td('all'), total, value === null, () => pick(null), t('branchCount', { count: branches.length }))}
                  <div className="my-1.5 h-px bg-line" />
                </>
            }
              {groups.map(([region, list]) =>
            <div key={region} className="mb-1">
                  <div className="px-2 pb-1 pt-2 text-[11px] font-semibold text-subtle">{g(region)}</div>
                  {list.map((b) =>
              <React.Fragment key={b.id}>
                      {row(g(b.name), counts[b.name] ?? 0, value === b.name, () => pick(b.name))}
                    </React.Fragment>
              )}
                </div>
            )}
              {resultCount === 0 &&
            <div className="px-3 py-8 text-center">
                  <p className="text-sm font-semibold text-ink">{t('notFound')}</p>
                  <p className="mt-0.5 text-xs text-muted">{t('noResult', { query })}</p>
                </div>
            }
            </div>

            <div className="flex items-center justify-between border-t border-line bg-surface-2 px-3 py-2 text-[11px] text-muted">
              <span>{query ? t('results', { count: resultCount }) : t('footerStats', { branches: branches.length, people: total })}</span>
              <span className="tabular-nums">{t('escClose')}</span>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}