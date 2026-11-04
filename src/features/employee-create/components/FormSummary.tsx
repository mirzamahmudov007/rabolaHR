'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircleIcon, CheckIcon, InfoIcon, ScanFaceIcon } from 'lucide-react';
import { Avatar } from '@/shared/components/Avatar';
import { Tooltip } from '@/shared/ui/Tooltip';
import { formSections } from '@/shared/data/employeeFormOptions';
import { usePayroll } from '@/shared/context/PayrollContext';
import { useFmtMoney, useGloss } from '@/shared/i18n/format';
import { estimateMonthly, scheduleSummary, sectionIssues } from '@/shared/utils/employeeForm';
import type { EmployeeForm, FormErrors, FormSectionId } from '@/shared/types/employeeForm';

interface FormSummaryProps {
  form: EmployeeForm;
  allErrors: FormErrors;
  showErrors: boolean;
}

function useActiveSection(): FormSectionId {
  const [active, setActive] = useState<FormSectionId>('personal');
  useEffect(() => {
    const els = formSections().map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id as FormSectionId);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, []);
  return active;
}

export function FormSummary({ form, allErrors, showErrors }: FormSummaryProps) {
  const t = useTranslations('create.summary');
  const tw = useTranslations('create.workplace');
  const tsal = useTranslations('create.salary');
  const dash = useTranslations('ui')('dash');
  const { g } = useGloss();
  const money = useFmtMoney();
  const sectionHelp: Record<FormSectionId, string> = {
    personal: t('helpPersonal'),
    workplace: t('helpWorkplace'),
    schedule: t('helpSchedule'),
    salary: t('helpSalary')
  };

  const name = [form.lastName, form.firstName].filter(Boolean).join(' ');
  const { templates } = usePayroll();
  const template = templates.find((tpl) => tpl.id === form.templateId);
  const estimate = estimateMonthly(form, template);
  const active = useActiveSection();
  const sections = formSections().map((s) => ({ ...s, issues: sectionIssues(s.id, allErrors) }));
  const done = sections.filter((s) => s.issues.length === 0).length;
  const remaining = Object.keys(allErrors).length;

  const rows: [string, string][] = [
  [
  t('rowBranch'),
  form.branch ? `${g(form.branch)}${form.multiBranch && form.extraBranches.length ? ` +${form.extraBranches.length}` : ''}` : dash],

  [t('rowContract'), `${form.employment === 'fixed' ? tw('fixed') : tw('permanent')}${form.probation ? ` ${t('probationSuffix', { count: form.probationMonths })}` : ''}`],
  [t('rowWorkType'), g(form.workType)],
  [t('rowSchedule'), scheduleSummary(form)],
  [t('rowPay'), template ? `${g(template.name)}${form.baseOverride || form.disabledRules.length || form.extraRules.length ? ` ${t('customSuffix')}` : ''}` : dash],
  [t('rowMonthly'), estimate ? tsal('estimateValue', { amount: money(estimate) }) : dash]];


  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <aside className="space-y-4">
      <nav className="rounded-xl border border-line bg-surface shadow-card" aria-label={t('navAria')}>
        <div className="border-b border-line p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">{t('heading')}</h2>
            <span className="text-xs tabular-nums text-muted">
              {t('doneCount', { done, total: sections.length })}
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1" aria-hidden>
            {sections.map((s) =>
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-colors duration-200 ${
              s.issues.length === 0 ? 'bg-present' : showErrors ? 'bg-absent' : 'bg-line'}`
              } />

            )}
          </div>
          <p className="mt-2.5 text-xs text-muted">
            {remaining === 0 ?
            t('allDone') :
            showErrors ?
            t('someErrors', { count: remaining }) :
            t('stillMissing', { count: remaining })}
          </p>
        </div>

        <ol className="p-2">
          {sections.map((s, i) => {
            const complete = s.issues.length === 0;
            const isError = !complete && showErrors;
            const isActive = active === s.id;
            const tip =
            <>
                <span className="block font-semibold">{s.label}</span>
                <span className="mt-1 block text-surface/75">{sectionHelp[s.id]}</span>
                {!complete &&
              <span className="mt-2 block border-t border-surface/15 pt-2">
                    {s.issues.map((iss) =>
                <span key={iss.key} className="flex items-start gap-1.5">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-current" />
                        {iss.message}
                      </span>
                )}
                  </span>
              }
              </>;

            return (
              <li key={s.id}>
                <Tooltip content={tip} side="left" className="block">
                  <button
                    type="button"
                    onClick={() => go(s.id)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 ${
                    isActive ? 'bg-surface-2' : 'hover:bg-surface-2'}`
                    }>
                    
                    <span
                      className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors duration-150 ${
                      complete ?
                      'bg-present text-white' :
                      isError ?
                      'bg-absent text-white' :
                      isActive ?
                      'bg-ink text-surface' :
                      'border border-line text-muted'}`
                      }
                      aria-hidden>
                      
                      {complete ? <CheckIcon className="h-3 w-3" strokeWidth={3.5} /> : isError ? '!' : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className={`text-[13px] font-medium ${isError ? 'text-absent-ink' : 'text-ink'}`}>{s.label}</span>
                        {isActive && <span className="text-[11px] text-muted">{t('hereNow')}</span>}
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-xs ${
                        complete ? 'text-present-ink' : isError ? 'text-absent-ink' : 'text-muted'}`
                        }>
                        
                        {complete ?
                        t('completed') :
                        `${isError ? t('checkIt') : t('remaining')}: ${s.issues.map((x) => x.label).join(', ')}`}
                      </span>
                    </span>
                  </button>
                </Tooltip>
              </li>);

          })}
        </ol>

        <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-present" /> {t('legendDone')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-line" /> {t('legendEmpty')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-absent" /> {t('legendError')}
          </span>
        </div>
      </nav>

      <div className="rounded-xl border border-line bg-surface shadow-card">
        <div className="flex items-center gap-3 border-b border-line p-4">
          {form.photo ?
          <img src={form.photo} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-line" /> :

          <Avatar name={name || '?'} />
          }
          <div className="min-w-0 flex-1">
            <div className={`truncate text-sm font-semibold ${name ? 'text-ink' : 'text-subtle'}`}>{name || t('newEmployee')}</div>
            <div className="truncate text-xs text-muted">
              {form.code} · {form.position ? g(form.position) : t('positionUnset')}
            </div>
          </div>
          <Tooltip content={t('previewTip')} side="left">
            <InfoIcon className="h-4 w-4 text-subtle" aria-label={t('infoAria')} />
          </Tooltip>
        </div>
        <dl className="px-4 py-2">
          {rows.map(([k, v]) =>
          <div key={k} className="flex items-start justify-between gap-4 py-1.5 text-[13px]">
              <dt className="shrink-0 text-muted">{k}</dt>
              <dd className={`min-w-0 text-right font-medium ${v === dash ? 'text-subtle' : 'text-ink'}`}>{v}</dd>
            </div>
          )}
        </dl>
        {!form.photo &&
        <button
          type="button"
          onClick={() => go('personal')}
          className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-start gap-2 rounded-lg bg-late-soft px-3 py-2 text-left text-xs text-late-ink transition-opacity duration-150 hover:opacity-90">
          
            <ScanFaceIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              {t('noPhoto')} <span className="font-semibold underline-offset-2 hover:underline">{t('addPhoto')}</span>
            </span>
          </button>
        }
        {showErrors && remaining > 0 &&
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-lg bg-absent-soft px-3 py-2 text-xs text-absent-ink">
            <AlertCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
            {t('fixErrors')}
          </div>
        }
      </div>
    </aside>);

}