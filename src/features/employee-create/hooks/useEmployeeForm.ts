import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { defaultEmployeeForm } from '@/shared/data/employeeFormOptions';
import { TODAY } from '@/shared/utils/date';
import { validate } from '@/shared/utils/employeeForm';
import { useScreenInit } from '@/shared/lib/useScreenInit';
import type { EmployeeForm } from '@/shared/types/employeeForm';

interface ScreenState {
  workType?: EmployeeForm['workType'];
  templateId?: string;
  showErrors?: boolean;
  prefill?: 'edgeCases';
}

function buildInitial(s: ScreenState): EmployeeForm {
  const base: EmployeeForm = {
    ...defaultEmployeeForm,
    workType: s.workType ?? defaultEmployeeForm.workType,
    templateId: s.templateId ?? defaultEmployeeForm.templateId,
    ...(s.workType === 'Sikl' ? { startTime: '08:00', endTime: '20:00' } : {})
  };
  if (s.prefill !== 'edgeCases') return base;
  return {
    ...base,
    firstName: 'Mustafo',
    lastName: 'Qodirov',
    phone: '901234567',
    branch: 'Chilonzor filiali',
    multiBranch: true,
    extraBranches: ['Markaziy ofis'],
    position: 'Frontend dasturchi',
    hireDate: subDays(TODAY, 45),
    employment: 'fixed',
    contractEnd: null,
    probation: true,
    workDays: [0, 1, 2, 3, 4, 5],
    templateId: 'tpl-office',
    baseOverride: true,
    baseAmount: 6500000,
    disabledRules: ['r-perfect']
  };
}

export function useEmployeeForm() {
  const screenInit = useScreenInit() as ScreenState;
  const [initial, setInitial] = useState<EmployeeForm>(() => buildInitial(screenInit));
  const [form, setForm] = useState<EmployeeForm>(initial);
  const [showErrors, setShowErrors] = useState<boolean>(screenInit.showErrors ?? screenInit.prefill === 'edgeCases');

  const set = <K extends keyof EmployeeForm,>(key: K, value: EmployeeForm[K]) =>
  setForm((f) => ({ ...f, [key]: value }));

  const allErrors = useMemo(() => validate(form), [form]);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  return {
    form,
    set,
    allErrors,
    errors: showErrors ? allErrors : {},
    showErrors,
    setShowErrors,
    dirty,
    /** Replace the whole form (e.g. restoring a draft) and treat it as the new baseline. */
    replace: (f: EmployeeForm) => {
      setForm(f);
      setInitial(f);
    },
    reset: () => {
      setForm(defaultEmployeeForm);
      setInitial(defaultEmployeeForm);
      setShowErrors(false);
    }
  };
}