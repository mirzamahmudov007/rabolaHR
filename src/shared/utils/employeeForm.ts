import { employees } from '@/shared/data/employees';
import { registeredPhones } from '@/shared/data/registeredPhones';
import { shiftOptions, weekdayLabels } from '@/shared/data/employeeFormOptions';
import { getStaticLocale, t } from '@/shared/i18n/static';
import { intlLocale, type Locale } from '@/shared/i18n/config';
import type { Employee } from '@/shared/types/employee';
import type { PayTemplate } from '@/shared/types/payroll';
import type { EmployeeForm, FormErrors, FormSectionId } from '@/shared/types/employeeForm';

export const fieldSection: Record<string, FormSectionId> = {
  photo: 'personal',
  firstName: 'personal',
  lastName: 'personal',
  phone: 'personal',
  birthDate: 'personal',
  code: 'personal',
  branch: 'workplace',
  extraBranches: 'workplace',
  position: 'workplace',
  contractEnd: 'workplace',
  workDays: 'schedule',
  endTime: 'schedule',
  lunchEnd: 'schedule',
  shifts: 'schedule',
  cycleWork: 'schedule',
  templateId: 'salary',
  baseAmount: 'salary'
};

/** Field names quoted in the error list of the summary panel. */
const fieldLabelKey: Record<string, string> = {
  firstName: 'create.personal.firstName',
  lastName: 'create.personal.lastName',
  phone: 'create.personal.phone',
  code: 'create.personal.code',
  branch: 'create.workplace.branch',
  extraBranches: 'create.workplace.addBranch',
  position: 'create.workplace.position',
  contractEnd: 'create.workplace.contractEnd',
  workDays: 'create.schedule.workDays',
  endTime: 'create.field.workTime',
  lunchEnd: 'create.field.lunchTime',
  shifts: 'create.schedule.shifts',
  cycleWork: 'create.field.cycleDays',
  templateId: 'create.salary.template',
  baseAmount: 'create.field.personalPay'
};

export function sectionIssues(id: FormSectionId, errors: FormErrors): {key: string;label: string;message: string;}[] {
  return Object.entries(errors).
  filter(([k]) => fieldSection[k] === id).
  map(([k, m]) => ({ key: k, label: t(fieldLabelKey[k] ?? k), message: m ?? '' }));
}

export function formatPhone(digits: string): string {
  const d = digits.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  let out = '';
  if (parts[0]) out += `(${parts[0]}${parts[0].length === 2 ? ')' : ''}`;
  if (parts[1]) out += ` ${parts[1]}`;
  if (parts[2]) out += `-${parts[2]}`;
  if (parts[3]) out += `-${parts[3]}`;
  return out;
}

/**
 * Grouped amount without the currency word — the dictionaries add it (`common.money`),
 * because the spacing and the case of the unit differ per language.
 */
const groupers = new Map<Locale, Intl.NumberFormat>();

export function formatMoney(n: number | null): string {
  if (n === null) return '';
  const locale = getStaticLocale();
  let nf = groupers.get(locale);
  if (!nf) {
    nf = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 });
    groupers.set(locale, nf);
  }
  return nf.format(Math.round(n)).replace(/[\u00a0\u202f]/g, ' ');
}

export const parseMoney = (s: string): number | null => {
  const digits = s.replace(/\D/g, '');
  return digits ? Number(digits.slice(0, 12)) : null;
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export function shiftLengthHours(start: string, end: string, lunch = 0): number {
  let diff = toMinutes(end) - toMinutes(start);
  if (diff <= 0) diff += 24 * 60;
  return Math.max(0, (diff - lunch) / 60);
}

export function hoursPerDay(f: EmployeeForm): number {
  if (f.workType === 'Smenali') return 8;
  return shiftLengthHours(f.startTime, f.endTime, f.workType === 'Oddiy' && f.lunchBreak ? lunchMinutes(f) : 0);
}

export function lunchMinutes(f: EmployeeForm): number {
  const diff = toMinutes(f.lunchEnd) - toMinutes(f.lunchStart);
  return diff > 0 ? diff : 0;
}

function lunchError(f: EmployeeForm): string | undefined {
  if (f.workType !== 'Oddiy' || !f.lunchBreak) return;
  const ls = toMinutes(f.lunchStart);
  const le = toMinutes(f.lunchEnd);
  if (le <= ls) return t('create.err.lunchOrder');
  const ws = toMinutes(f.startTime);
  const we = toMinutes(f.endTime);
  if (we > ws && (ls < ws || le > we)) return t('create.err.lunchInside', { start: f.startTime, end: f.endTime });
  return;
}

export function daysPerMonth(f: EmployeeForm): number {
  if (f.workType === 'Oddiy') return Math.round(f.workDays.length * 4.33);
  if (f.workType === 'Smenali') return 22;
  const total = f.cycleWork + f.cycleRest;
  return total > 0 ? Math.round(30 * f.cycleWork / total) : 0;
}

/** Average hours per week; null for shift work where it depends on the roster. */
export function weeklyHours(f: EmployeeForm): number | null {
  if (f.workType === 'Oddiy') return hoursPerDay(f) * f.workDays.length;
  if (f.workType === 'Sikl') {
    const total = f.cycleWork + f.cycleRest;
    return total > 0 ? hoursPerDay(f) * f.cycleWork * 7 / total : null;
  }
  return null;
}

export function baseAmountFor(f: EmployeeForm, t?: PayTemplate): number | null {
  if (!t) return null;
  return f.baseOverride ? f.baseAmount : t.amount;
}

/** Estimated monthly base pay before penalties / bonuses. */
export function estimateMonthly(f: EmployeeForm, t?: PayTemplate): number | null {
  const base = baseAmountFor(f, t);
  if (!t || !base) return null;
  switch (t.payType) {
    case 'monthly':
    case 'commission':
      return base;
    case 'hourly':
      return Math.round(base * hoursPerDay(f) * daysPerMonth(f));
    case 'daily':
      return base * daysPerMonth(f);
  }
}

export function scheduleSummary(f: EmployeeForm): string {
  const days = [...f.workDays].sort((a, b) => a - b);
  if (f.workType === 'Oddiy') {
    const contiguous = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
    const names = weekdayLabels();
    const label = !days.length ?
    t('create.fmt.noDays') :
    contiguous && days.length > 2 ?
    `${names[days[0]]}–${names[days[days.length - 1]]}` :
    days.map((d) => names[d]).join(', ');
    return t('create.fmt.daysHours', { days: label, times: `${f.startTime}–${f.endTime}` });
  }
  if (f.workType === 'Smenali') {
    const names = shiftOptions().filter((s) => f.shifts.includes(s.id)).map((s) => s.label.toLowerCase());
    return names.length ?
    t('create.fmt.shiftWord', { names: names.join(', ') }) +
    (f.shiftRotation === 'weekly' ? t('create.fmt.weeklyRotation') : '') :
    t('create.fmt.noShifts');
  }
  return t('create.fmt.cycle', { work: f.cycleWork, rest: f.cycleRest, times: `${f.startTime}–${f.endTime}` });
}

export interface Duplicates {
  nameMatch?: Employee;
  phoneMatch?: Employee;
  codeMatch?: Employee;
}

export function findDuplicates(f: EmployeeForm): Duplicates {
  const first = f.firstName.trim().toLowerCase();
  const last = f.lastName.trim().toLowerCase();
  const nameMatch = first && last ? employees.find((e) => e.name.toLowerCase() === `${first} ${last}`) : undefined;
  const phoneOwner = f.phone.length === 9 ? registeredPhones[f.phone] : undefined;
  const phoneMatch = phoneOwner ? employees.find((e) => e.id === phoneOwner) : undefined;
  const code = f.code.trim().toUpperCase();
  const codeMatch = code ? employees.find((e) => e.code.toUpperCase() === code) : undefined;
  return { nameMatch, phoneMatch, codeMatch };
}

export function validate(f: EmployeeForm): FormErrors {
  const e: FormErrors = {};
  const dup = findDuplicates(f);
  if (!f.firstName.trim()) e.firstName = t('create.err.firstName');
  if (!f.lastName.trim()) e.lastName = t('create.err.lastName');
  if (!f.phone) e.phone = t('create.err.phone');else
  if (f.phone.length < 9) e.phone = t('create.err.phoneShort');else
  if (dup.phoneMatch) e.phone = t('create.err.phoneTaken', { name: dup.phoneMatch.name, code: dup.phoneMatch.code });
  if (!f.code.trim()) e.code = t('create.err.code');else
  if (dup.codeMatch) e.code = t('create.err.codeTaken', { name: dup.codeMatch.name });

  if (!f.branch) e.branch = t('create.err.branch');
  if (f.multiBranch && f.extraBranches.length === 0) e.extraBranches = t('create.err.extraBranches');
  if (!f.position) e.position = t('create.err.position');
  if (f.employment === 'fixed') {
    if (!f.contractEnd) e.contractEnd = t('create.err.contractEnd');else
    if (f.contractEnd <= f.hireDate) e.contractEnd = t('create.err.contractEndBefore');
  }

  if (f.workType === 'Oddiy' && f.workDays.length === 0) e.workDays = t('create.err.workDays');
  if (f.workType !== 'Smenali' && f.startTime === f.endTime) e.endTime = t('create.err.timesSame');
  const lunch = lunchError(f);
  if (lunch) e.lunchEnd = lunch;
  if (f.workType === 'Smenali' && f.shifts.length === 0) e.shifts = t('create.err.shifts');
  if (f.workType === 'Sikl' && (f.cycleWork < 1 || f.cycleRest < 1)) e.cycleWork = t('create.err.cycle');

  if (!f.templateId) e.templateId = t('create.err.template');
  if (f.templateId && f.baseOverride && !f.baseAmount) e.baseAmount = t('create.err.baseAmount');
  return e;
}

export function sectionComplete(id: FormSectionId, errors: FormErrors): boolean {
  return !Object.keys(errors).some((k) => fieldSection[k] === id);
}