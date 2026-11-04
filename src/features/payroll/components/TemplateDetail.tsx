'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { CopyIcon, PencilIcon, UsersIcon } from 'lucide-react';
import { RuleLine } from '@/shared/components/RuleLine';
import { Avatar } from '@/shared/components/Avatar';
import { IconButton } from '@/shared/ui/IconButton';
import { usePayroll } from '@/shared/context/PayrollContext';
import { useGloss } from '@/shared/i18n/format';
import { kindMeta } from '@/shared/data/payrollTriggers';
import { payBaseText, payTypeTitle, templateEmployees } from '@/shared/utils/payroll';
import type { PayTemplate, RuleKind } from '@/shared/types/payroll';

interface TemplateDetailProps {
  template: PayTemplate;
  onEdit: () => void;
  onDuplicate: () => void;
}

export function TemplateDetail({ template: tpl, onEdit, onDuplicate }: TemplateDetailProps) {
  const t = useTranslations('payroll.detail');
  const tc = useTranslations('common');
  const td = useTranslations('data');
  const { g } = useGloss();
  const { rules } = usePayroll();
  const included = rules.filter((r) => tpl.ruleIds.includes(r.id));
  const people = templateEmployees(tpl);

  return (
    <article className="rounded-xl border border-line bg-surface shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{g(tpl.name)}</h2>
          {tpl.description && <p className="mt-0.5 text-[13px] text-muted">{g(tpl.description)}</p>}
        </div>
        <div className="flex items-center gap-1">
          <IconButton onClick={onDuplicate} label={t('duplicate')} icon={<CopyIcon className="h-4 w-4" aria-hidden />} />
          <IconButton onClick={onEdit} label={tc('edit')} icon={<PencilIcon className="h-4 w-4" aria-hidden />} />
        </div>
      </header>

      <div className="grid gap-px border-b border-line bg-line sm:grid-cols-3">
        <div className="bg-surface px-6 py-4 sm:col-span-1">
          <div className="text-xs text-muted">{t('basePay')} · {payTypeTitle(tpl.payType)}</div>
          <div className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-ink">{payBaseText(tpl)}</div>
        </div>
        {(['penalty', 'bonus'] as RuleKind[]).map((k) =>
        <div key={k} className="bg-surface px-6 py-4">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${kindMeta[k].dot}`} />
              {td(`rule.kind.${k === 'penalty' ? 'penaltyPlural' : 'bonusPlural'}`)}
            </div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-ink">{included.filter((r) => r.kind === k).length}</div>
          </div>
        )}
      </div>

      <section className="px-6 py-5">
        <h3 className="text-sm font-semibold text-ink">{t('appliedRules')}</h3>
        {included.length === 0 ?
        <p className="mt-2 text-[13px] text-muted">{t('noRules')}</p> :

        <div className="mt-1 divide-y divide-line">
            {included.map((r) =>
          <RuleLine
            key={r.id}
            rule={r}
            muted={!r.active}
            badge={!r.active ? <span className="rounded bg-field px-1.5 text-[11px] font-medium text-muted">{t('inactiveBadge')}</span> : undefined} />

          )}
          </div>
        }
      </section>

      <section className="border-t border-line px-6 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">{t('recommended')}</h3>
          <span className="text-xs text-muted">{tpl.branches.length ? t('branchCount', { count: tpl.branches.length }) : t('allBranches')}</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {tpl.positions.length ?
          tpl.positions.map((p) =>
          <span key={p} className="rounded-md border border-line px-2 py-0.5 text-[13px] text-body">
                {g(p)}
              </span>
          ) :

          <span className="text-[13px] text-muted">{t('noPositions')}</span>
          }
        </div>
        <div className="mt-4 flex items-center gap-3">
          {people.length > 0 ?
          <>
              <div className="flex -space-x-2">
                {people.slice(0, 6).map((e) =>
              <span key={e.id} className="rounded-full ring-2 ring-surface">
                    <Avatar name={e.name} src={e.photo} />
                  </span>
              )}
              </div>
              <span className="text-[13px] text-muted">
                {t.rich('matches', { count: people.length, b: (chunk) => <span className="font-semibold text-ink">{chunk}</span> })}
              </span>
            </> :

          <span className="flex items-center gap-2 text-[13px] text-muted">
              <UsersIcon className="h-4 w-4" aria-hidden />
              {t('noMatch')}
            </span>
          }
        </div>
      </section>
    </article>);

}