'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowLeftIcon, FileClockIcon, Loader2Icon } from 'lucide-react';
import { useEmployeeForm } from '@/features/employee-create/hooks/useEmployeeForm';
import { PersonalSection } from '@/features/employee-create/components/PersonalSection';
import { WorkplaceSection } from '@/features/employee-create/components/WorkplaceSection';
import { ScheduleSection } from '@/features/employee-create/components/ScheduleSection';
import { SalarySection } from '@/features/employee-create/components/SalarySection';
import { FormSummary } from '@/features/employee-create/components/FormSummary';
import { LeaveConfirmDialog } from '@/features/employee-create/components/LeaveConfirmDialog';
import { CheckboxField } from '@/shared/ui/CheckboxField';
import { Button } from '@/shared/ui/Button';
import { fieldSection } from '@/shared/utils/employeeForm';
import { clearDraft, loadDraft, saveDraft } from '@/features/employee-create/utils/employeeDraft';
import { formatDate } from '@/shared/utils/date';
import { formSections } from '@/shared/data/employeeFormOptions';
import type { Draft } from '@/features/employee-create/utils/employeeDraft';

const scrollToSection = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function EmployeeCreate() {
  const router = useRouter();
  const t = useTranslations('create');
  const tc = useTranslations('common');
  const { form, set, errors, allErrors, showErrors, setShowErrors, dirty, replace, reset } = useEmployeeForm();
  const [saving, setSaving] = useState(false);
  const [addAnother, setAddAnother] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(() => loadDraft());

  const errorCount = Object.keys(allErrors).length;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const requestLeave = () => dirty ? setLeaveOpen(true) : router.push('/');

  const storeDraft = () => {
    saveDraft(form);
    toast(t('draft.saved'), {
      description: form.photo ? t('draft.savedPhoto') : t('draft.savedHint')
    });
  };

  const save = () => {
    setShowErrors(true);
    if (errorCount > 0) {
      const section = formSections().find((s) => s.id === fieldSection[Object.keys(allErrors)[0]]);
      if (section) scrollToSection(section.id);
      toast.error(t('toast.fieldsBad'), { description: t('toast.fieldsCheck', { count: errorCount }) });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      clearDraft();
      setDraft(null);
      const name = `${form.lastName} ${form.firstName}`.trim();
      toast.success(t('toast.added'), {
        description: !form.photo ?
        t('toast.addedNoPhoto', { name }) :
        form.syncDevices ?
        t('toast.addedSync', { name }) :
        name
      });
      if (addAnother) {
        reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push('/');
      }
    }, 1100);
  };

  return (
    <div className="pb-24">
      <h1 className="sr-only">{t('pageTitle')}</h1>
      <nav className="mb-4 flex items-center gap-1.5 text-[13px]" aria-label={t('breadcrumbAria')}>
        <Button variant="link" onClick={requestLeave}>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {t('breadcrumbList')}
        </Button>
        <span className="text-subtle">/</span>
        <span className="font-medium text-ink">{t('breadcrumbCurrent')}</span>
      </nav>

      {draft &&
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-card">
          <FileClockIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <p className="min-w-0 flex-1 text-[13px] text-body">
            <span className="font-semibold text-ink">{t('draft.found')}</span>
            {' · '}
            {[draft.form.lastName, draft.form.firstName].filter(Boolean).join(' ') || t('unnamed')}, {formatDate(draft.savedAt)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearDraft();
                setDraft(null);
              }}>
              {t('draft.drop')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                replace(draft.form);
                setDraft(null);
                toast(t('draft.restored'));
              }}>
              {t('draft.resume')}
            </Button>
          </div>
        </div>
      }

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <form
          className="min-w-0 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          noValidate>
          
          <PersonalSection form={form} set={set} errors={errors} />
          <WorkplaceSection form={form} set={set} errors={errors} />
          <ScheduleSection form={form} set={set} errors={errors} />
          <SalarySection form={form} set={set} errors={errors} />

          <div className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 xl:mx-0 xl:rounded-xl xl:border xl:shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <CheckboxField checked={addAnother} onChange={setAddAnother}>
                  {t('footer.addAnother')}
                </CheckboxField>
                {showErrors && errorCount > 0 &&
                <span className="text-[13px] text-absent-ink">{t('toast.fieldsCheck', { count: errorCount })}</span>
                }
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={requestLeave}>
                  {tc('cancel')}
                </Button>
                <Button variant="secondary" onClick={storeDraft} disabled={!dirty}>
                  {t('footer.draft')}
                </Button>
                <Button type="submit" disabled={saving} className="min-w-[140px]">
                  {saving && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden />}
                  {saving ? tc('saving') : t('footer.save')}
                </Button>
              </div>
            </div>
          </div>
        </form>

        <div className="hidden xl:sticky xl:top-[88px] xl:block">
          <FormSummary form={form} allErrors={allErrors} showErrors={showErrors} />
        </div>
      </div>

      <LeaveConfirmDialog
        open={leaveOpen}
        onStay={() => setLeaveOpen(false)}
        onSaveDraft={() => {
          saveDraft(form);
          setLeaveOpen(false);
          toast(t('draft.saved'));
          router.push('/');
        }}
        onDiscard={() => {
          setLeaveOpen(false);
          router.push('/');
        }} />
      
    </div>);

}