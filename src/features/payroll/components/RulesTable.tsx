'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PencilIcon, SearchIcon, SearchXIcon } from 'lucide-react';
import { RuleKindBadge } from '@/features/payroll/components/RuleKindBadge';
import { Segmented } from '@/shared/form/Segmented';
import { TextInput } from '@/shared/form/TextInput';
import { Button } from '@/shared/ui/Button';
import { usePayroll } from '@/shared/context/PayrollContext';
import { useGloss } from '@/shared/i18n/format';
import { calcLabels, triggerMeta } from '@/shared/data/payrollTriggers';
import { describeRule, ruleExtras } from '@/shared/utils/payroll';
import type { PayrollRule, RuleKind } from '@/shared/types/payroll';

interface RulesTableProps {
  onEdit: (r: PayrollRule) => void;
}

export function RulesTable({ onEdit }: RulesTableProps) {
  const t = useTranslations('payroll.rules');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const { rules, templates, toggleRule } = usePayroll();
  const [kind, setKind] = useState<RuleKind | 'all'>('all');
  const [query, setQuery] = useState('');

  const usage = useMemo(() => {
    const m: Record<string, number> = {};
    templates.forEach((t) => t.ruleIds.forEach((id) => m[id] = (m[id] ?? 0) + 1));
    return m;
  }, [templates]);

  const q = query.trim().toLowerCase();
  const visible = rules.filter(
    (r) => (kind === 'all' || r.kind === kind) && (!q || r.name.toLowerCase().includes(q) || g(triggerMeta[r.trigger].label).toLowerCase().includes(q))
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Segmented
          label={t('filterAria')}
          value={kind}
          onChange={setKind}
          options={[
          { value: 'all', label: t('allCount', { count: rules.length }) },
          { value: 'penalty', label: t('penaltyCount', { count: rules.filter((r) => r.kind === 'penalty').length }) },
          { value: 'bonus', label: t('bonusCount', { count: rules.filter((r) => r.kind === 'bonus').length }) }] 
          } />
                
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPh')}
          aria-label={tc('search')}
          className="w-full sm:w-64"
          leading={<SearchIcon className="h-4 w-4" aria-hidden />} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-y border-line bg-surface-2">
              {[t('colRule'), t('colKind'), t('colCalc'), t('colTemplates'), t('colState'), ''].map((c, i) =>
              <th key={i} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-muted">
                  {c}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const extras = ruleExtras(r);
              return (
                <tr key={r.id} className={`border-b border-line transition-colors duration-150 last:border-0 hover:bg-surface-2 ${r.active ? '' : 'text-muted'}`}>
                  <td className="max-w-[420px] px-4 py-3.5">
                    <div className={`font-medium ${r.active ? 'text-ink' : 'text-muted'}`}>{g(r.name)}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-muted">{describeRule(r)}</div>
                    {extras.length > 0 && <div className="mt-0.5 text-xs text-subtle">{extras.join(' · ')}</div>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <RuleKindBadge kind={r.kind} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-body">
                    {r.calc === 'per_unit' ? tc('perUnit', { unit: g(triggerMeta[r.trigger].unit) }) : g(calcLabels[r.calc])}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] tabular-nums text-body">
                    {usage[r.id] ? t('usedCount', { count: usage[r.id] }) : <span className="text-subtle">{t('unused')}</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <button
                      role="switch"
                      aria-checked={r.active}
                      aria-label={t('toggleAria', { name: g(r.name), state: r.active ? t('active') : t('inactive') })}
                      onClick={() => toggleRule(r.id)}
                      className="inline-flex items-center gap-2 text-[13px]">
                      
                      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 ${r.active ? 'bg-present' : 'bg-line'}`}>
                        <span className={`inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform duration-200 ease-out ${r.active ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                      </span>
                      <span className={r.active ? 'text-present-ink' : 'text-muted'}>{r.active ? t('active') : t('inactive')}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      onClick={() => onEdit(r)}
                      variant="subtle"
                      size="sm"
                      icon={<PencilIcon className="h-3.5 w-3.5" aria-hidden />}>
                      
                      {tc('edit')}
                    </Button>
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
        {visible.length === 0 &&
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <SearchXIcon className="h-7 w-7 text-subtle" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-ink">{t('notFound')}</p>
            <p className="mt-1 text-sm text-muted">{t('notFoundDesc')}</p>
          </div>
        }
      </div>
    </div>);

}