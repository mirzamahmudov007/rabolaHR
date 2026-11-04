'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { LayersIcon, PencilIcon, PlusIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { FormSection } from '@/features/employee-create/components/FormSection';
import { Field } from '@/shared/form/Field';
import { MoneyInput } from '@/shared/form/MoneyInput';
import { SelectMenu } from '@/shared/form/SelectMenu';
import { RuleLine } from '@/shared/components/RuleLine';
import { RuleEditor } from '@/features/payroll/components/RuleEditor';
import { Button } from '@/shared/ui/Button';
import { usePayroll } from '@/shared/context/PayrollContext';
import { kindMeta } from '@/shared/data/payrollTriggers';
import { useFmtMoney, useGloss } from '@/shared/i18n/format';
import { daysPerMonth, estimateMonthly, hoursPerDay } from '@/shared/utils/employeeForm';
import { payBaseText, payTypeTitle, recommendTemplate } from '@/shared/utils/payroll';
import type { EmployeeForm, FormErrors } from '@/shared/types/employeeForm';
import type { PayrollRule, RuleKind } from '@/shared/types/payroll';

interface SectionProps {
  form: EmployeeForm;
  set: <K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) => void;
  errors: FormErrors;
}

export function SalarySection({ form, set, errors }: SectionProps) {
  const t = useTranslations('create.salary');
  const { g } = useGloss();
  const money = useFmtMoney();
  const { templates, rules } = usePayroll();
  const template = templates.find((tpl) => tpl.id === form.templateId);
  const recommended = recommendTemplate(templates, form.position, form.branch);
  const [editor, setEditor] = useState<{open: boolean;rule: PayrollRule | null;}>({ open: false, rule: null });

  const unitSuffix: Record<string, string> = {
    monthly: t('perMonth'),
    commission: t('perMonth'),
    hourly: t('perHour'),
    daily: t('perDay')
  };

  const pick = (id: string) => {
    set('templateId', id);
    set('disabledRules', []);
    set('baseOverride', false);
    set('baseAmount', null);
  };

  const options = templates.map((tpl) => ({
    value: tpl.id,
    label: g(tpl.name),
    hint: tpl.id === recommended?.id ? t('suggested') : payTypeTitle(tpl.payType)
  }));

  const included = template ? rules.filter((r) => template.ruleIds.includes(r.id)) : [];
  const toggleRule = (id: string) =>
  set('disabledRules', form.disabledRules.includes(id) ? form.disabledRules.filter((x) => x !== id) : [...form.disabledRules, id]);
  const estimate = estimateMonthly(form, template);
  const appliedCount = (k: RuleKind) =>
  included.filter((r) => r.kind === k && r.active && !form.disabledRules.includes(r.id)).length + form.extraRules.filter((r) => r.kind === k).length;

  return (
    <FormSection id="salary" title={t('title')} description={t('desc')}>
      {!template && recommended &&
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface-2 px-4 py-3">
          <SparklesIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] text-body">
            {t('recommend', { position: g(form.position ?? ''), name: g(recommended.name), pay: payBaseText(recommended) })}
          </p>
          <Button
          type="button"
          onClick={() => pick(recommended.id)}
          size="sm">
          
            {t('recommendPick')}
          </Button>
        </div>
      }

      <Field
        label={t('template')}
        htmlFor="template"
        required
        error={errors.templateId}
        hint={!form.position ? t('templateNoPosition') : t('templateCount', { count: templates.length })}
        className="sm:max-w-md">
        
        <SelectMenu
          id="template"
          value={form.templateId}
          options={options}
          onChange={pick}
          placeholder={t('templatePick')}
          searchPlaceholder={t('templateSearch')}
          invalid={!!errors.templateId}
          icon={<LayersIcon className="h-4 w-4" />} />
        
      </Field>

      {template &&
      <>
          <div className="rounded-lg border border-line">
            <div className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted">
                  {t('base')} · {payTypeTitle(template.payType)}
                  {form.baseOverride && <span className="rounded bg-late-soft px-1.5 py-px text-[11px] font-semibold text-late-ink">{t('customBadge')}</span>}
                </div>
                {!form.baseOverride ?
              <div className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-ink">{payBaseText(template)}</div> :

              <div className="mt-2 w-full max-w-xs">
                    <MoneyInput
                  id="baseAmount"
                  value={form.baseAmount}
                  onChange={(v) => set('baseAmount', v)}
                  suffix={unitSuffix[template.payType]}
                  invalid={!!errors.baseAmount} />
                
                    <p className={`mt-1.5 text-xs ${errors.baseAmount ? 'text-absent-ink' : 'text-muted'}`}>
                      {errors.baseAmount ?? t('templateAmount', { amount: money(template.amount) })}
                    </p>
                  </div>
              }
              </div>
              <Button
              type="button"
              onClick={() => {
                set('baseOverride', !form.baseOverride);
                set('baseAmount', form.baseOverride ? null : template.amount);
              }}
              variant="secondary"
              size="sm"
              icon={!form.baseOverride && <PencilIcon className="h-3.5 w-3.5" aria-hidden />}>
              
                {form.baseOverride ? t('revertBase') : t('overrideBase')}
              </Button>
            </div>
            {(template.payType === 'hourly' || template.payType === 'daily') && estimate &&
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-line bg-surface-2 px-4 py-2.5 text-[13px]">
                <span className="text-muted">
                  {t('estimate', { days: daysPerMonth(form) })}{template.payType === 'hourly' ? t('estimateHours', { hours: hoursPerDay(form).toFixed(0) }) : ''}
                </span>
                <span className="font-semibold tabular-nums text-ink">{t('estimateValue', { amount: money(estimate) })}</span>
              </div>
          }
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{t('rulesTitle')}</h3>
              <span className="flex items-center gap-3 text-xs text-muted">
                {(['penalty', 'bonus'] as RuleKind[]).map((k) =>
              <span key={k} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${kindMeta[k].dot}`} />
                    {k === 'penalty' ? t('countPenalty', { count: appliedCount(k) }) : t('countBonus', { count: appliedCount(k) })}
                  </span>
              )}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{t('rulesHint')}</p>

            <div className="mt-2 divide-y divide-line rounded-lg border border-line px-4">
              {included.length === 0 && form.extraRules.length === 0 &&
            <p className="py-4 text-[13px] text-muted">{t('rulesEmpty')}</p>
            }
              {included.map((r) => {
              const off = form.disabledRules.includes(r.id);
              return (
                <RuleLine
                  key={r.id}
                  rule={r}
                  muted={off || !r.active}
                  badge={
                  !r.active ?
                  <span className="rounded bg-field px-1.5 text-[11px] font-medium text-muted">{t('ruleInactive')}</span> :
                  off ?
                  <span className="rounded bg-field px-1.5 text-[11px] font-medium text-muted">{t('ruleOff')}</span> :
                  undefined
                  }
                  trailing={
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!off}
                    aria-label={t('ruleApplyAria', { name: g(r.name) })}
                    title={off ? t('ruleTurnOn') : t('ruleTurnOff')}
                    disabled={!r.active}
                    onClick={() => toggleRule(r.id)}
                    className={`relative mt-1 inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 disabled:opacity-40 ${!off ? 'bg-ink' : 'bg-line'}`}>
                    
                        <span className={`inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform duration-200 ease-out ${!off ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                      </button>
                  } />);


            })}
              {form.extraRules.map((r) =>
            <RuleLine
              key={r.id}
              rule={r}
              badge={<span className="rounded bg-late-soft px-1.5 text-[11px] font-semibold text-late-ink">{t('rulePersonal')}</span>}
              trailing={
              <span className="flex gap-1">
                      <button
                  type="button"
                  onClick={() => setEditor({ open: true, rule: r })}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink"
                  aria-label={t('ruleEditAria', { name: g(r.name) })}>
                  
                        <PencilIcon className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                  type="button"
                  onClick={() => set('extraRules', form.extraRules.filter((x) => x.id !== r.id))}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-absent-soft hover:text-absent-ink"
                  aria-label={t('ruleDeleteAria', { name: g(r.name) })}>
                  
                        <Trash2Icon className="h-4 w-4" aria-hidden />
                      </button>
                    </span>
              } />

            )}
            </div>

            <Button
            type="button"
            onClick={() => setEditor({ open: true, rule: null })}
            variant="dashed"
            className="mt-2.5"
            icon={<PlusIcon className="h-4 w-4" aria-hidden />}>
            
              {t('addRule')}
            </Button>
          </div>

          <p className="text-xs text-muted">
            {t('footnote', { name: g(template.name) })}
          </p>
        </>
      }

      <RuleEditor
        open={editor.open}
        rule={editor.rule}
        context={t('ruleContext')}
        onClose={() => setEditor({ open: false, rule: null })}
        onSave={(r) => {
          const exists = form.extraRules.some((x) => x.id === r.id);
          set('extraRules', exists ? form.extraRules.map((x) => x.id === r.id ? r : x) : [...form.extraRules, r]);
          setEditor({ open: false, rule: null });
          toast.success(exists ? t('ruleUpdated') : t('ruleAdded'), { description: g(r.name) });
        }} />
      
    </FormSection>);

}