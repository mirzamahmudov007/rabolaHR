import { t } from '@/shared/i18n/static';
import { text } from '@/shared/i18n/glossary';
import { triggerMeta } from '@/shared/data/payrollTriggers';
import { employees } from '@/shared/data/employees';
import { formatMoney } from '@/shared/utils/employeeForm';
import type { Employee } from '@/shared/types/employee';
import type { PayTemplate, PayrollRule } from '@/shared/types/payroll';

const som = (n: number) => t('common.money', { amount: formatMoney(Math.round(n)) });

function conditionText(r: PayrollRule): string {
  switch (r.trigger) {
    case 'late':
      return t('rules.cond.late', { min: r.threshold });
    case 'early_leave':
      return t('rules.cond.earlyLeave', { min: r.threshold });
    case 'absent':
      return t('rules.cond.absent');
    case 'overtime':
      return r.threshold > 0 ? t('rules.cond.overtimeOver', { h: r.threshold }) : t('rules.cond.overtimeAny');
    case 'holiday_work':
      return t('rules.cond.holiday');
    case 'night_shift':
      return t('rules.cond.night');
    case 'perfect_month':
      return t('rules.cond.perfect');
    case 'sales_plan':
      return t('rules.cond.sales', { pct: r.threshold });
  }
}

export function amountText(r: PayrollRule): string {
  const meta = triggerMeta[r.trigger];
  switch (r.calc) {
    case 'fixed':
      return meta.mode === 'event' ? t('rules.amount.perEvent', { amount: som(r.amount) }) : som(r.amount);
    case 'per_unit':
      return t('rules.amount.perUnit', { amount: som(r.amount), unit: text(meta.unit) });
    case 'percent':
      return meta.mode === 'event' ? t('rules.amount.percentEvent', { pct: r.amount }) : t('rules.amount.percent', { pct: r.amount });
    case 'tiered':
      return [...r.tiers].
      sort((a, b) => a.from - b.from).
      map((tier) => t('rules.amount.tieredItem', { from: tier.from, amount: formatMoney(tier.amount) })).
      join(', ');
  }
}

/** Full human-readable sentence, e.g. "10 daqiqadan ko'p kechiksa — har holat uchun 20 000 so'm ushlab qolinadi." */
export function describeRule(r: PayrollRule): string {
  const verb = r.kind === 'penalty' ? t('rules.verbWithheld') : t('rules.verbAdded');
  return t('rules.describe', { cond: conditionText(r), amount: amountText(r), verb });
}

export function ruleExtras(r: PayrollRule): string[] {
  const out: string[] = [];
  if (r.freeTimes > 0) out.push(t('rules.extra.free', { count: r.freeTimes }));
  if (r.monthlyCap) out.push(t('rules.extra.cap', { amount: som(r.monthlyCap) }));
  return out;
}

/** Worked example used in the rule editor preview. */
export function ruleExample(r: PayrollRule, base = 6000000): {text: string;steps: string;total: number;} {
  const meta = triggerMeta[r.trigger];
  const { count, value } = meta.sample;
  const unit = text(meta.unit);
  const daily = base / 22;
  let total = 0;
  let steps = '';

  if (meta.mode === 'event') {
    const qualifies = meta.thresholdLabel === null || value > r.threshold;
    const counted = qualifies ? Math.max(0, count - r.freeTimes) : 0;
    const forgiven = qualifies ? Math.min(count, r.freeTimes) : 0;
    let each = 0;
    if (r.calc === 'fixed') each = r.amount;
    if (r.calc === 'per_unit') each = r.amount * value;
    if (r.calc === 'percent') each = base * r.amount / 100;
    if (r.calc === 'tiered') each = [...r.tiers].sort((a, b) => b.from - a.from).find((tier) => value >= tier.from)?.amount ?? 0;
    total = counted * each;
    steps = !qualifies ?
    t('rules.ex.overUnit', { value, unit }) :
    `${forgiven ? t('rules.ex.forgiven', { count: forgiven }) : ''}${counted} × ${formatMoney(Math.round(each))}`;
  } else if (meta.mode === 'quantity') {
    const qualifies = value > r.threshold;
    if (r.calc === 'per_unit') total = qualifies ? value * r.amount : 0;
    if (r.calc === 'fixed') total = qualifies ? r.amount : 0;
    if (r.calc === 'percent') total = qualifies ? daily * r.amount / 100 * value : 0;
    steps = !qualifies ?
    t('rules.ex.under') :
    r.calc === 'per_unit' ?
    t('rules.ex.unitTimes', { value, unit, amount: formatMoney(r.amount) }) :
    r.calc === 'percent' ?
    t('rules.ex.ofDaily', { value, unit, pct: r.amount }) :
    t('data.rule.calc.fixed');
  } else {
    const qualifies = r.trigger !== 'sales_plan' || value > r.threshold;
    total = qualifies ? r.calc === 'percent' ? base * r.amount / 100 : r.amount : 0;
    steps = r.calc === 'percent' ? `${formatMoney(base)} × ${r.amount}%` : t('data.rule.calc.fixed');
  }

  const capped = r.monthlyCap ? Math.min(total, r.monthlyCap) : total;
  if (capped < total) steps += t('rules.ex.capped', { amount: formatMoney(r.monthlyCap ?? 0) });
  return { text: t('rules.ex.person', { note: t(`data.rule.sample.${r.trigger}`) }), steps, total: Math.round(capped) };
}

export function payBaseText(tpl: Pick<PayTemplate, 'payType' | 'amount' | 'commissionPercent'>): string {
  switch (tpl.payType) {
    case 'monthly':
      return `${som(tpl.amount)} / ${t('data.unit.month')}`;
    case 'hourly':
      return `${som(tpl.amount)} / ${t('data.unit.hour')}`;
    case 'daily':
      return `${som(tpl.amount)} / ${t('data.unit.day')}`;
    case 'commission':
      return `${som(tpl.amount)} + ${tpl.commissionPercent ?? 0}%`;
  }
}

export const payTypeTitle = (type: PayTemplate['payType']) => t(`data.payType.${type}`);

export function templateEmployees(t: PayTemplate): Employee[] {
  return employees.filter(
    (e) => t.positions.includes(e.position) && (t.branches.length === 0 || t.branches.includes(e.branch))
  );
}

export function recommendTemplate(templates: PayTemplate[], position: string | null, branch: string | null): PayTemplate | undefined {
  if (!position) return undefined;
  return (
    templates.find((t) => t.positions.includes(position) && branch && t.branches.includes(branch)) ??
    templates.find((t) => t.positions.includes(position) && t.branches.length === 0));

}

export const newRuleId = () => `r-${Date.now().toString(36)}`;
export const newTemplateId = () => `tpl-${Date.now().toString(36)}`;