import { defaultEmployeeForm } from '@/shared/data/employeeFormOptions';
import type { EmployeeForm } from '@/shared/types/employeeForm';

const KEY = 'rabola:employee-draft';

interface StoredDraft {
  savedAt: string;
  form: Record<string, unknown>;
}

export interface Draft {
  savedAt: Date;
  form: EmployeeForm;
}

const toDate = (v: unknown): Date | null => typeof v === 'string' ? new Date(v) : null;

/** The photo is a temporary object URL, so it is intentionally not persisted. */
export function saveDraft(form: EmployeeForm) {
  const { photo: _photo, ...rest } = form;
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: new Date().toISOString(), form: rest }));
  } catch {

    /* storage unavailable — ignore */}
}

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredDraft;
    const partial = s.form as Partial<EmployeeForm>;
    return {
      savedAt: new Date(s.savedAt),
      form: {
        ...defaultEmployeeForm,
        ...partial,
        photo: null,
        birthDate: toDate(s.form.birthDate),
        contractEnd: toDate(s.form.contractEnd),
        hireDate: toDate(s.form.hireDate) ?? defaultEmployeeForm.hireDate,
        cycleStart: toDate(s.form.cycleStart) ?? defaultEmployeeForm.cycleStart
      }
    };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY);
  } catch {

    /* ignore */}
}