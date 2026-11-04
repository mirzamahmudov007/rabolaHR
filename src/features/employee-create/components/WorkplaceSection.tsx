'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { addMonths, addYears, differenceInCalendarDays, differenceInMonths } from 'date-fns';
import { BriefcaseIcon, BuildingIcon, PlusIcon, XIcon } from 'lucide-react';
import { FormSection } from '@/features/employee-create/components/FormSection';
import { Field } from '@/shared/form/Field';
import { SelectMenu } from '@/shared/form/SelectMenu';
import { Segmented } from '@/shared/form/Segmented';
import { Toggle } from '@/shared/form/Toggle';
import { DatePicker } from '@/shared/ui/DatePicker';
import { branches } from '@/shared/data/branches';
import { positionOptions, probationOptions } from '@/shared/data/employeeFormOptions';
import { employees } from '@/shared/data/employees';
import { useGloss } from '@/shared/i18n/format';
import { TODAY, formatDate } from '@/shared/utils/date';
import type { EmployeeForm, FormErrors } from '@/shared/types/employeeForm';

interface SectionProps {
  form: EmployeeForm;
  set: <K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) => void;
  errors: FormErrors;
}

const branchCounts = employees.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.branch]: (acc[e.branch] ?? 0) + 1 }), {});

export function WorkplaceSection({ form, set, errors }: SectionProps) {
  const t = useTranslations('create.workplace');
  const { g } = useGloss();
  const branchOptions = branches.map((b) => ({ value: b.name, label: g(b.name), group: g(b.region), hint: `${branchCounts[b.name] ?? 0}` }));
  const positions = positionOptions();
  const daysFromToday = differenceInCalendarDays(form.hireDate, TODAY);
  const hireHint =
  daysFromToday > 0 ?
  t('hireFuture', { date: formatDate(form.hireDate) }) :
  undefined;
  const hireWarning =
  daysFromToday < -7 ?
  t('hirePast', { days: Math.abs(daysFromToday) }) :
  undefined;

  const extraOptions = branchOptions.filter((b) => b.value !== form.branch && !form.extraBranches.includes(b.value));
  const contractMonths = form.contractEnd ? differenceInMonths(form.contractEnd, form.hireDate) : null;

  return (
    <FormSection id="workplace" title={t('title')} description={t('desc')}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('branch')} htmlFor="branch" required error={errors.branch} hint={t('branchHint', { count: branches.length })}>
          <SelectMenu
            id="branch"
            value={form.branch}
            options={branchOptions}
            onChange={(v) => {
              set('branch', v);
              set('extraBranches', form.extraBranches.filter((b) => b !== v));
            }}
            placeholder={t('branchPick')}
            searchPlaceholder={t('searchBranchRegion')}
            invalid={!!errors.branch}
            icon={<BuildingIcon className="h-4 w-4" />} />
          
        </Field>
        <Field label={t('position')} htmlFor="position" required error={errors.position} hint={t('positionHint')}>
          <SelectMenu
            id="position"
            value={form.position}
            options={positions}
            onChange={(v) => set('position', v)}
            placeholder={t('positionPick')}
            searchPlaceholder={t('positionSearch')}
            invalid={!!errors.position}
            creatable
            icon={<BriefcaseIcon className="h-4 w-4" />} />
          
        </Field>
      </div>

      <div className={`space-y-3 rounded-lg border p-4 ${errors.extraBranches ? 'border-absent/60' : 'border-line'} bg-surface-2`}>
        <Toggle
          checked={form.multiBranch}
          onChange={(v) => set('multiBranch', v)}
          label={t('multi')}
          description={t('multiDesc')} />
        
        {form.multiBranch &&
        <div className="space-y-2.5">
            {form.extraBranches.length > 0 &&
          <ul className="flex flex-wrap gap-1.5">
                {form.extraBranches.map((b) =>
            <li key={b} className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface pl-2.5 pr-1 text-[13px] text-ink">
                {g(b)}
                    <button
                type="button"
                onClick={() => set('extraBranches', form.extraBranches.filter((x) => x !== b))}
                className="flex h-5 w-5 items-center justify-center rounded text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink"
                aria-label={t('removeBranch', { name: g(b) })}>
                
                      <XIcon className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </li>
            )}
              </ul>
          }
            <div className="sm:max-w-sm">
              <SelectMenu
              value={null}
              options={extraOptions}
              onChange={(v) => set('extraBranches', [...form.extraBranches, v])}
              placeholder={t('addBranch')}
              searchPlaceholder={t('searchBranch')}
              icon={<PlusIcon className="h-4 w-4" />} />
            
            </div>
            {errors.extraBranches && <p className="text-xs text-absent-ink">{errors.extraBranches}</p>}
          </div>
        }
      </div>

      <div className="h-px bg-line" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('hireDate')} htmlFor="hireDate" hint={hireHint} warning={hireWarning}>
          <DatePicker id="hireDate" block value={form.hireDate} onChange={(d) => set('hireDate', d)} maxDate={addYears(TODAY, 1)} />
        </Field>
        <Field label={t('contractType')}>
          <Segmented
            label={t('contractType')}
            value={form.employment}
            onChange={(v) => set('employment', v)}
            options={[
            { value: 'permanent', label: t('permanent') },
            { value: 'fixed', label: t('fixed') }]
            } />
          
        </Field>
      </div>

      {form.employment === 'fixed' &&
      <Field
        label={t('contractEnd')}
        htmlFor="contractEnd"
        required
        error={errors.contractEnd}
        hint={contractMonths !== null && contractMonths >= 0 ? t('contractMonths', { months: contractMonths }) : undefined}
        className="sm:max-w-[calc(50%-0.625rem)]">
        
          <DatePicker
          id="contractEnd"
          block
          value={form.contractEnd}
          onChange={(d) => set('contractEnd', d)}
          maxDate={addYears(TODAY, 5)}
          defaultMonth={addMonths(form.hireDate, 12)} />
        
        </Field>
      }

      <div className="space-y-3 rounded-lg border border-line bg-surface-2 p-4">
        <Toggle
          checked={form.probation}
          onChange={(v) => set('probation', v)}
          label={t('probation')}
          description={t('probationDesc')} />
        
        {form.probation &&
        <div className="flex flex-wrap items-center gap-3">
            <Segmented
            label={t('probation')}
            value={form.probationMonths}
            onChange={(v) => set('probationMonths', v)}
            options={probationOptions.map((m) => ({ value: m, label: t('probationMonths', { count: m }) }))} />
          
            <span className="text-xs text-muted">
              {t('probationEnds')} <span className="font-medium tabular-nums text-ink">{formatDate(addMonths(form.hireDate, form.probationMonths))}</span>
            </span>
          </div>
        }
      </div>

      <div className="rounded-lg border border-line bg-surface-2 p-4">
        <Toggle
          checked={form.syncDevices}
          onChange={(v) => set('syncDevices', v)}
          label={t('sync')}
          description={
          form.branch ?
          t('syncDesc', { branches: `${g(form.branch)}${form.multiBranch && form.extraBranches.length ? t('syncExtra', { count: form.extraBranches.length }) : ''}` }) :
          t('syncGeneric')
          } />
        
        {form.syncDevices && !form.photo &&
        <p className="mt-2 text-xs text-late-ink">{t('syncNoPhoto')}</p>
        }
      </div>
    </FormSection>);

}