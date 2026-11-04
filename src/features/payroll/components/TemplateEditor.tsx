'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BanknoteIcon, ClockIcon, PercentIcon, SunriseIcon } from 'lucide-react';
import { Drawer } from '@/shared/ui/Drawer';
import { Button } from '@/shared/ui/Button';
import { useGloss } from '@/shared/i18n/format';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { MoneyInput } from '@/shared/form/MoneyInput';
import { OptionCard, CheckMark } from '@/shared/form/OptionCard';
import { ChipSelect } from '@/shared/form/ChipSelect';
import { usePayroll } from '@/shared/context/PayrollContext';
import { kindMeta } from '@/shared/data/payrollTriggers';
import { payTypeOptions, positionOptions } from '@/shared/data/employeeFormOptions';
import { branches } from '@/shared/data/branches';
import { describeRule, newTemplateId } from '@/shared/utils/payroll';
import type { PayBase, PayTemplate, RuleKind } from '@/shared/types/payroll';

interface TemplateEditorProps {
  open: boolean;
  template: PayTemplate | null;
  onClose: () => void;
  onSave: (t: PayTemplate) => void;
}

const payIcon: Record<PayBase, React.ReactNode> = {
  monthly: <BanknoteIcon className="h-4 w-4" />,
  hourly: <ClockIcon className="h-4 w-4" />,
  daily: <SunriseIcon className="h-4 w-4" />,
  commission: <PercentIcon className="h-4 w-4" />
};

const amountMeta: Record<PayBase, {labelKey: string;unitKey: 'month' | 'hour' | 'day';placeholder: string;}> = {
  monthly: { labelKey: 'amount.monthlyLabel', unitKey: 'month', placeholder: '6 000 000' },
  hourly: { labelKey: 'amount.hourlyLabel', unitKey: 'hour', placeholder: '30 000' },
  daily: { labelKey: 'amount.dailyLabel', unitKey: 'day', placeholder: '250 000' },
  commission: { labelKey: 'amount.commissionLabel', unitKey: 'month', placeholder: '3 500 000' }
};

const blank = (): PayTemplate => ({
  id: newTemplateId(),
  name: '',
  description: '',
  payType: 'monthly',
  amount: 0,
  commissionPercent: null,
  ruleIds: [],
  positions: [],
  branches: []
});

export function TemplateEditor({ open, template, onClose, onSave }: TemplateEditorProps) {
  const tf = useTranslations('templateEditor');
  const tc = useTranslations('common');
  const td = useTranslations('data');
  const { g } = useGloss();
  const { rules } = usePayroll();
  const [t, setT] = useState<PayTemplate>(template ?? blank());
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) {
      setT(template ?? blank());
      setTried(false);
    }
  }, [open, template]);

  const set = <K extends keyof PayTemplate,>(k: K, v: PayTemplate[K]) => setT((x) => ({ ...x, [k]: v }));
  const toggleRule = (id: string) => set('ruleIds', t.ruleIds.includes(id) ? t.ruleIds.filter((r) => r !== id) : [...t.ruleIds, id]);

  const errors = {
    name: !t.name.trim() ? tf('errName') : undefined,
    amount: !t.amount ? tf('errAmount') : undefined,
    percent: t.payType === 'commission' && !t.commissionPercent ? tf('errPercent') : undefined
  };
  const valid = !errors.name && !errors.amount && !errors.percent;
  const am = amountMeta[t.payType];
  const positionOpts = positionOptions();
  const branchOpts = branches.map((b) => ({ value: b.name, label: g(b.name), group: g(b.region) }));

  const save = () => {
    setTried(true);
    if (valid) onSave({ ...t, name: t.name.trim(), description: t.description.trim() });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="max-w-2xl"
      title={template ? tf('titleEdit') : tf('titleNew')}
      subtitle={tf('subtitle')}
      footer={
      <>
          <span className="mr-auto text-[13px] text-muted">{tf('selectedCount', { count: t.ruleIds.length })}</span>
          <Button variant="neutral" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={save} className="px-4">
            {tf('save')}
          </Button>
        </>
      }>
      
      <div className="space-y-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={tf('nameLabel')} htmlFor="tpl-name" required error={tried ? errors.name : undefined}>
            <TextInput id="tpl-name" value={t.name} onChange={(e) => set('name', e.target.value)} placeholder={tf('namePh')} invalid={tried && !!errors.name} />
          </Field>
          <Field label={tf('descLabel')} htmlFor="tpl-desc" optional>
            <TextInput id="tpl-desc" value={t.description} onChange={(e) => set('description', e.target.value)} placeholder={tf('descPh')} />
          </Field>
        </div>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-ink">{tf('baseHeading')}</h3>
          <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label={tf('payTypeAria')}>
            {payTypeOptions().map((o) =>
            <OptionCard key={o.value} selected={t.payType === o.value} title={o.title} description={o.description} icon={payIcon[o.value]} onSelect={() => set('payType', o.value)} />
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label={tf(am.labelKey)} htmlFor="tpl-amount" required error={tried ? errors.amount : undefined}>
              <MoneyInput id="tpl-amount" value={t.amount || null} onChange={(v) => set('amount', v ?? 0)} suffix={tc('moneyPer', { unit: td(`unit.${am.unitKey}`) })} placeholder={am.placeholder} invalid={tried && !!errors.amount} />
            </Field>
            {t.payType === 'commission' &&
            <Field label={tf('commissionShare')} htmlFor="tpl-percent" required error={tried ? errors.percent : undefined}>
                <TextInput
                id="tpl-percent"
                inputMode="decimal"
                value={t.commissionPercent ?? ''}
                onChange={(e) => set('commissionPercent', Math.min(100, parseFloat(e.target.value.replace(',', '.')) || 0) || null)}
                trailing="%"
                invalid={tried && !!errors.percent}
                className="tabular-nums" />
              
              </Field>
            }
          </div>
        </section>

        <section>
          <div className="mb-1 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-ink">{tf('rulesHeading')}</h3>
            <span className="text-xs text-muted">{tf('rulesHint')}</span>
          </div>
          {(['penalty', 'bonus'] as RuleKind[]).map((kind) =>
          <div key={kind} className="mt-3">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted">
                <span className={`h-1.5 w-1.5 rounded-full ${kindMeta[kind].dot}`} />
                {td(`rule.kind.${kind === 'penalty' ? 'penaltyPlural' : 'bonusPlural'}`)}
              </div>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {rules.
              filter((r) => r.kind === kind).
              map((r) => {
                const on = t.ruleIds.includes(r.id);
                return (
                  <li key={r.id}>
                        <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggleRule(r.id)}
                      className={`flex w-full items-start gap-3 px-3.5 py-3 text-left transition-colors duration-150 ${on ? 'bg-surface-2' : 'hover:bg-surface-2'}`}>
                      
                          <CheckMark checked={on} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-sm font-medium text-ink">
                              {g(r.name)}
                              {!r.active && <span className="rounded bg-field px-1.5 text-[11px] font-medium text-muted">{tf('inactive')}</span>}
                            </span>
                            <span className="mt-0.5 block text-[13px] text-muted">{describeRule(r)}</span>
                          </span>
                        </button>
                      </li>);

              })}
              </ul>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-ink">{tf('recommended')}</h3>
          <p className="mb-3 mt-0.5 text-[13px] text-muted">{tf('recommendedDesc')}</p>
          <div className="space-y-4">
            <Field label={tf('positionsLabel')}>
              <ChipSelect value={t.positions} options={positionOpts} onChange={(v) => set('positions', v)} addLabel={tf('addPosition')} emptyText={tf('positionsEmpty')} creatable />
            </Field>
            <Field label={tf('branchesLabel')}>
              <ChipSelect value={t.branches} options={branchOpts} onChange={(v) => set('branches', v)} addLabel={tf('addBranch')} emptyText={tf('branchesEmpty')} />
            </Field>
          </div>
        </section>
      </div>
    </Drawer>);

}