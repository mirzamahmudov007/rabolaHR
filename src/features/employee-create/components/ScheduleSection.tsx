'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { addDays } from 'date-fns';
import { AlertTriangleIcon, CalendarClockIcon, RefreshCcwIcon, SunIcon } from 'lucide-react';
import { FormSection } from '@/features/employee-create/components/FormSection';
import { Field } from '@/shared/form/Field';
import { CheckMark, OptionCard } from '@/shared/form/OptionCard';
import { Segmented } from '@/shared/form/Segmented';
import { Stepper } from '@/shared/form/Stepper';
import { TimeInput } from '@/shared/form/TimeInput';
import { Toggle } from '@/shared/form/Toggle';
import { DatePicker } from '@/shared/ui/DatePicker';
import { graceOptions, shiftOptions, weekdayLabels, workTypeOptions } from '@/shared/data/employeeFormOptions';
import { hoursPerDay, lunchMinutes, weeklyHours } from '@/shared/utils/employeeForm';
import { MAX_WEEKLY_HOURS } from '@/shared/data/employeeFormOptions';
import { TODAY } from '@/shared/utils/date';
import type { WorkType } from '@/shared/types/employee';
import type { EmployeeForm, FormErrors } from '@/shared/types/employeeForm';

interface SectionProps {
  form: EmployeeForm;
  set: <K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) => void;
  errors: FormErrors;
}

const workTypeIcon: Record<WorkType, React.ReactNode> = {
  Oddiy: <SunIcon className="h-4 w-4" />,
  Smenali: <RefreshCcwIcon className="h-4 w-4" />,
  Sikl: <CalendarClockIcon className="h-4 w-4" />
};

export function ScheduleSection({ form, set, errors }: SectionProps) {
  const t = useTranslations('create.schedule');
  const tn = useTranslations('common');
  const toggleDay = (d: number) =>
  set('workDays', form.workDays.includes(d) ? form.workDays.filter((x) => x !== d) : [...form.workDays, d]);
  const toggleShift = (id: string) =>
  set('shifts', form.shifts.includes(id) ? form.shifts.filter((x) => x !== id) : [...form.shifts, id]);

  const hours = hoursPerDay(form);
  const weekly = weeklyHours(form);
  const overnight = form.endTime <= form.startTime && form.startTime !== form.endTime;

  return (
    <FormSection id="schedule" title={t('title')} description={t('desc')}>
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t('typeAria')}>
        {workTypeOptions().map((o) =>
        <OptionCard
          key={o.value}
          selected={form.workType === o.value}
          title={o.title}
          description={o.description}
          icon={workTypeIcon[o.value]}
          onSelect={() => set('workType', o.value)} />

        )}
      </div>

      {form.workType === 'Oddiy' &&
      <Field label={t('workDays')} required error={errors.workDays}>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('workDays')}>
            {weekdayLabels().map((d, i) => {
            const on = form.workDays.includes(i);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                aria-label={on ? t('dayOn', { day: d }) : t('dayOff', { day: d })}
                title={on ? t('dayOnTip') : t('dayOffTip')}
                onClick={() => toggleDay(i)}
                className={`h-10 w-11 rounded-lg border text-[13px] font-semibold transition-colors duration-150 ${
                on ?
                'border-present/30 bg-present-soft text-present-ink hover:border-present/60' :
                'border-absent/25 bg-absent-soft text-absent-ink hover:border-absent/50'}`
                }>
                
                  {d}
                </button>);

          })}
            <span className="flex items-center gap-3 pl-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-present" aria-hidden />
                {t('daysOn', { count: form.workDays.length })}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-absent" aria-hidden />
                {t('daysRest', { count: 7 - form.workDays.length })}
              </span>
            </span>
          </div>
        </Field>
      }

      {form.workType === 'Smenali' &&
      <>
          <Field label={t('shifts')} required error={errors.shifts} hint={t('shiftsHint')}>
            <div className="grid gap-2 sm:grid-cols-3">
              {shiftOptions().map((s) => {
              const on = form.shifts.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => toggleShift(s.id)}
                  className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors duration-150 ${
                  errors.shifts ? 'border-absent/60' : 'border-line'} ${
                  on ? 'bg-surface-2' : 'bg-surface hover:border-ink/20'}`}>
                  
                    <CheckMark checked={on} />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{s.label}</span>
                      <span className="block text-xs tabular-nums text-muted">{s.time}</span>
                    </span>
                  </button>);

            })}
            </div>
          </Field>
          {form.shifts.length > 1 &&
        <Field label={t('rotation')}>
              <Segmented
            label={t('rotation')}
            value={form.shiftRotation}
            onChange={(v) => set('shiftRotation', v)}
            options={[
            { value: 'weekly', label: t('rotationWeekly') },
            { value: 'fixed', label: t('rotationFixed') }]
            } />
          
            </Field>
        }
        </>
      }

      {form.workType === 'Sikl' &&
      <>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label={t('cycleWork')} error={errors.cycleWork}>
              <Stepper label={t('cycleWork')} value={form.cycleWork} onChange={(v) => set('cycleWork', v)} min={1} max={14} suffix={t('suffixDay')} />
            </Field>
            <Field label={t('cycleRest')}>
              <Stepper label={t('cycleRest')} value={form.cycleRest} onChange={(v) => set('cycleRest', v)} min={1} max={14} suffix={t('suffixDay')} />
            </Field>
            <Field label={t('cycleStart')} htmlFor="cycleStart">
              <DatePicker id="cycleStart" block value={form.cycleStart} onChange={(d) => set('cycleStart', d)} maxDate={addDays(TODAY, 60)} />
            </Field>
          </div>
          <CyclePreview form={form} />
        </>
      }

      {form.workType !== 'Smenali' &&
      <div className="grid gap-5 sm:grid-cols-3">
          <Field label={t('start')} htmlFor="startTime">
            <TimeInput id="startTime" value={form.startTime} onChange={(v) => set('startTime', v)} />
          </Field>
          <Field
          label={t('end')}
          htmlFor="endTime"
          error={errors.endTime}
          hint={overnight ? t('overnight') : undefined}>
          
            <TimeInput id="endTime" value={form.endTime} onChange={(v) => set('endTime', v)} invalid={!!errors.endTime} />
          </Field>
          <div className="flex items-end pb-2.5 text-[13px] text-muted">
            {t('hoursPerDay', { hours: hours.toFixed(hours % 1 ? 1 : 0) })}
            {form.workType === 'Oddiy' && form.lunchBreak && ` ${t('hoursNet')}`}
          </div>
        </div>
      }

      {weekly !== null && weekly > MAX_WEEKLY_HOURS &&
      <div className="flex items-start gap-2.5 rounded-lg border border-late/25 bg-late-soft px-4 py-3">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-late-ink" aria-hidden />
          <p className="text-[13px] text-late-ink">
            <span className="font-semibold">{t('weeklyTitle', { hours: weekly.toFixed(weekly % 1 ? 1 : 0) })}</span> — {t('weeklyBody', { max: MAX_WEEKLY_HOURS })}
          </p>
        </div>
      }

      {form.workType === 'Oddiy' &&
      <div className="space-y-3 rounded-lg border border-line bg-surface-2 p-4">
          <Toggle
          checked={form.lunchBreak}
          onChange={(v) => set('lunchBreak', v)}
          label={t('lunch')}
          description={t('lunchDesc')} />
        
          {form.lunchBreak &&
        <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t('lunchStart')} htmlFor="lunchStart">
                <TimeInput id="lunchStart" value={form.lunchStart} onChange={(v) => set('lunchStart', v)} invalid={!!errors.lunchEnd} />
              </Field>
              <Field label={t('lunchEnd')} htmlFor="lunchEnd" error={errors.lunchEnd}>
                <TimeInput id="lunchEnd" value={form.lunchEnd} onChange={(v) => set('lunchEnd', v)} invalid={!!errors.lunchEnd} />
              </Field>
              {!errors.lunchEnd &&
          <div className="flex items-end pb-2.5 text-[13px] text-muted">
                  {t('lunchLength', { minutes: lunchMinutes(form) })}
                </div>
          }
            </div>
        }
        </div>
      }

      <Field label={t('grace')} hint={t('graceHint')}>
        <Segmented
          label={t('grace')}
          value={form.graceMinutes}
          onChange={(v) => set('graceMinutes', v)}
          options={graceOptions.map((m) => ({ value: m, label: m === 0 ? tn('none') : t('graceMin', { count: m }) }))} />
        
      </Field>
    </FormSection>);

}

function CyclePreview({ form }: {form: EmployeeForm;}) {
  const t = useTranslations('create.schedule');
  const wdays = weekdayLabels();
  const total = form.cycleWork + form.cycleRest;
  const days = Array.from({ length: 14 }, (_, i) => addDays(form.cycleStart, i));
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-body">{t('previewTitle')}</span>
        <span className="flex items-center gap-3 text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-present" /> {t('previewWork')}</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-absent" /> {t('previewRest')}</span>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-14">
        {days.map((d, i) => {
          const work = total > 0 && i % total < form.cycleWork;
          const wd = (d.getDay() + 6) % 7;
          return (
            <div
              key={i}
              className={`flex flex-col items-center rounded-md py-1.5 ring-1 ring-inset ${
              work ? 'bg-present-soft text-present-ink ring-present/25' : 'bg-absent-soft text-absent-ink ring-absent/20'}`
              }
              title={work ? t('previewWork') : t('previewRest')}>
              
              <span className="text-[10px]">{wdays[wd]}</span>
              <span className="text-[13px] font-semibold tabular-nums">{d.getDate()}</span>
            </div>);

        })}
      </div>
    </div>);

}