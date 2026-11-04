'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Drawer } from '@/shared/ui/Drawer';
import { useGloss } from '@/shared/i18n/format';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { MoneyInput } from '@/shared/form/MoneyInput';
import { Segmented } from '@/shared/form/Segmented';
import { SelectMenu } from '@/shared/form/SelectMenu';
import { Stepper } from '@/shared/form/Stepper';
import { Toggle } from '@/shared/form/Toggle';
import { Button } from '@/shared/ui/Button';
import { calcLabels, kindMeta, triggerMeta } from '@/shared/data/payrollTriggers';
import { describeRule, newRuleId, ruleExample, ruleExtras } from '@/shared/utils/payroll';
import { formatMoney } from '@/shared/utils/employeeForm';
import type { PayrollRule, RuleCalc, RuleKind, RuleTrigger } from '@/shared/types/payroll';

interface RuleEditorProps {
  open: boolean;
  rule: PayrollRule | null;
  onClose: () => void;
  onSave: (rule: PayrollRule) => void;
  /** Shown in the subtitle, e.g. for per-employee rules. */
  context?: string;
}

const blank = (kind: RuleKind = 'penalty'): PayrollRule => ({
  id: newRuleId(),
  name: '',
  kind,
  trigger: kind === 'penalty' ? 'late' : 'overtime',
  threshold: kind === 'penalty' ? 10 : 0,
  freeTimes: 0,
  calc: kind === 'penalty' ? 'fixed' : 'per_unit',
  amount: kind === 'penalty' ? 20000 : 40000,
  tiers: [
  { from: 10, amount: 20000 },
  { from: 30, amount: 50000 }],

  monthlyCap: null,
  active: true
});

export function RuleEditor({ open, rule, onClose, onSave, context }: RuleEditorProps) {
  const te = useTranslations('ruleEditor');
  const tc = useTranslations('common');
  const td = useTranslations('data');
  const { g } = useGloss();
  const [r, setR] = useState<PayrollRule>(rule ?? blank());
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (open) {
      setR(rule ?? blank());
      setTried(false);
    }
  }, [open, rule]);

  const set = <K extends keyof PayrollRule,>(k: K, v: PayrollRule[K]) => setR((x) => ({ ...x, [k]: v }));
  const meta = triggerMeta[r.trigger];
  const triggerOptions = (kind: RuleKind) =>
  (Object.keys(triggerMeta) as RuleTrigger[]).
  filter((tr) => triggerMeta[tr].kind === kind).
  map((tr) => ({ value: tr, label: g(triggerMeta[tr].label), group: g(triggerMeta[tr].group) }));

  const changeKind = (kind: RuleKind) => setR((x) => ({ ...blank(kind), id: x.id, name: x.name }));
  const changeTrigger = (t: RuleTrigger) => {
    const m = triggerMeta[t];
    setR((x) => ({
      ...x,
      trigger: t,
      calc: m.calcs.includes(x.calc) ? x.calc : m.calcs[0],
      threshold: m.thresholdUnit === '%' ? 100 : m.thresholdLabel ? 10 : 0,
      freeTimes: m.mode === 'event' ? x.freeTimes : 0
    }));
  };

  const errors = {
    name: !r.name.trim() ? te('errName') : undefined,
    amount:
    r.calc === 'tiered' ?
    r.tiers.some((t) => !t.amount) ?
    te('errTier') :
    undefined :
    !r.amount ?
    te('errValue') :
    r.calc === 'percent' && r.amount > 100 ?
    te('errPercentMax') :
    undefined
  };
  const valid = !errors.name && !errors.amount;
  const example = useMemo(() => ruleExample(r), [r]);
  const km = kindMeta[r.kind];

  const save = () => {
    setTried(true);
    if (!valid) return;
    onSave({ ...r, name: r.name.trim(), tiers: [...r.tiers].sort((a, b) => a.from - b.from) });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={rule ? te('titleEdit') : te('titleNew')}
      subtitle={context ?? te('subtitle')}
      footer={
      <>
          <Button variant="neutral" onClick={onClose}>
            {tc('cancel')}
          </Button>
          <Button onClick={save} className="px-4">
            {te('save')}
          </Button>
        </>
      }>
      
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <Field label={te('kindLabel')}>
            <Segmented
              label={te('kindLabel')}
              value={r.kind}
              onChange={changeKind}
              options={[
              { value: 'penalty', label: td('rule.kind.penalty') },
              { value: 'bonus', label: td('rule.kind.bonus') }] 
              } />
                      
          </Field>
          <Field label={te('nameLabel')} htmlFor="rule-name" required error={tried ? errors.name : undefined}>
            <TextInput
              id="rule-name"
              value={r.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={r.kind === 'penalty' ? te('namePhPenalty') : te('namePhBonus')}
              invalid={tried && !!errors.name} />
            
          </Field>
        </div>

        <Step n={1} title={te('stepWhen')}>
          <SelectMenu value={r.trigger} options={triggerOptions(r.kind)} onChange={(v) => changeTrigger(v as RuleTrigger)} placeholder={te('triggerPh')} />
          {(meta.thresholdLabel || meta.mode === 'event') &&
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {meta.thresholdLabel &&
            <Field label={g(meta.thresholdLabel)} htmlFor="threshold">
                  <TextInput
                id="threshold"
                inputMode="numeric"
                value={r.threshold}
                onChange={(e) => set('threshold', Number(e.target.value.replace(/\D/g, '').slice(0, 4)) || 0)}
                trailing={g(meta.thresholdUnit)}
                className="tabular-nums" />
              
                </Field>
            }
              {meta.mode === 'event' &&
            <Field label={te('freeLabel')} hint={te('freeHint')}>
                  <Stepper label={te('freeAria')} value={r.freeTimes} onChange={(v) => set('freeTimes', v)} min={0} max={10} suffix={tc('units.times')} />
                </Field>
            }
            </div>
          }
        </Step>

        <Step n={2} title={r.kind === 'penalty' ? te('stepAmountPenalty') : te('stepAmountBonus')}>
          <Segmented
            label={te('calcLabel')}
            value={r.calc}
            onChange={(v: RuleCalc) => set('calc', v)}
            options={meta.calcs.map((c) => ({ value: c, label: c === 'per_unit' ? tc('perUnit', { unit: g(meta.unit) }) : g(calcLabels[c]) }))} />
          
          <div className="mt-4">
            {r.calc === 'tiered' ?
            <TierEditor rule={r} onChange={(tiers) => set('tiers', tiers)} error={tried ? errors.amount : undefined} /> :
            r.calc === 'percent' ?
            <Field label={meta.mode === 'event' ? te('perEventPercent') : te('percentOfBase')} htmlFor="amount" error={tried ? errors.amount : undefined} className="sm:max-w-[200px]">
                <TextInput
                id="amount"
                inputMode="decimal"
                value={r.amount || ''}
                onChange={(e) => set('amount', Math.min(100, parseFloat(e.target.value.replace(',', '.')) || 0))}
                trailing="%"
                invalid={tried && !!errors.amount}
                className="tabular-nums" />
              
              </Field> :

            <Field
              label={r.calc === 'per_unit' ? tc('perUnitFor', { unit: g(meta.unit) }) : meta.mode === 'event' ? te('perEvent') : te('amountWord')}
              htmlFor="amount"
              error={tried ? errors.amount : undefined}
              className="sm:max-w-xs">
              
                <MoneyInput id="amount" value={r.amount || null} onChange={(v) => set('amount', v ?? 0)} invalid={tried && !!errors.amount} />
              </Field>
            }
          </div>
        </Step>

        <Step n={3} title={te('stepCap')} optional>
          <Toggle
            checked={r.monthlyCap !== null}
            onChange={(v) => set('monthlyCap', v ? 300000 : null)}
            label={te('capLabel')}
            description={r.kind === 'penalty' ? te('capDescPenalty') : te('capDescBonus')} />
          
          {r.monthlyCap !== null &&
          <div className="mt-3 sm:max-w-xs">
              <MoneyInput value={r.monthlyCap} onChange={(v) => set('monthlyCap', v ?? 0)} suffix={te('capSuffix')} />
            </div>
          }
        </Step>

        <section className="rounded-lg border border-line bg-surface-2 p-4" aria-live="polite">
          <div className="text-xs font-medium text-muted">{te('result')}</div>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink">{describeRule(r)}</p>
          {ruleExtras(r).length > 0 && <p className="mt-1 text-[13px] text-muted">{ruleExtras(r).join(' · ')}</p>}
          <div className="mt-3 border-t border-line pt-3">
            <div className="text-xs text-muted">{te('example', { text: example.text })}</div>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[13px] tabular-nums text-body">{example.steps}</span>
              <span className={`text-base font-semibold tabular-nums ${r.kind === 'penalty' ? 'text-absent-ink' : 'text-present-ink'}`}>
                {example.total ? tc('money', { amount: `${km.sign}${formatMoney(example.total)}` }) : tc('money', { amount: '0' })}
              </span>
            </div>
          </div>
        </section>
      </div>
    </Drawer>);

}

function Step({ n, title, optional, children }: {n: number;title: string;optional?: boolean;children: React.ReactNode;}) {
  const te = useTranslations('ruleEditor');
  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-surface">{n}</span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {optional && <span className="text-xs text-subtle">{te('optional')}</span>}
      </div>
      {children}
    </section>);

}

function TierEditor({ rule, onChange, error }: {rule: PayrollRule;onChange: (t: PayrollRule['tiers']) => void;error?: string;}) {
  const tt = useTranslations('ruleEditor.tier');
  const tiers = rule.tiers;
  const update = (i: number, patch: Partial<PayrollRule['tiers'][number]>) => onChange(tiers.map((t, j) => j === i ? { ...t, ...patch } : t));
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid grid-cols-[1fr_1.4fr_40px] gap-3 border-b border-line bg-surface-2 px-3 py-2 text-xs font-medium text-muted">
          <span>{tt('from')}</span>
          <span>{tt('amount')}</span>
          <span />
        </div>
        {tiers.map((t, i) =>
        <div key={i} className="grid grid-cols-[1fr_1.4fr_40px] items-center gap-3 border-b border-line px-3 py-2 last:border-0">
            <TextInput
            inputMode="numeric"
            value={t.from}
            onChange={(e) => update(i, { from: Number(e.target.value.replace(/\D/g, '').slice(0, 4)) || 0 })}
            trailing={tt('fromTrailing')}
            aria-label={tt('fromAria')}
            className="tabular-nums" />
          
            <MoneyInput value={t.amount || null} onChange={(v) => update(i, { amount: v ?? 0 })} invalid={!!error && !t.amount} />
            <button
            type="button"
            onClick={() => onChange(tiers.filter((_, j) => j !== i))}
            disabled={tiers.length <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-absent-soft hover:text-absent-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
            aria-label={tt('deleteAria')}>
            
              <Trash2Icon className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-absent-ink">{error}</p>}
      <Button
        type="button"
        onClick={() => {
          const last = tiers[tiers.length - 1];
          onChange([...tiers, { from: (last?.from ?? 0) + 30, amount: 0 }]);
        }}
        variant="subtle"
        size="sm"
        className="mt-2"
        icon={<PlusIcon className="h-4 w-4" aria-hidden />}>
        
        {tt('add')}
      </Button>
    </div>);

}