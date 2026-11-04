import type { WorkType } from '@/shared/types/employee';
import type { PayrollRule } from '@/shared/types/payroll';

export type Gender = 'male' | 'female';
export type PayType = 'monthly' | 'hourly' | 'daily' | 'commission';
export type ShiftRotation = 'fixed' | 'weekly';
export type CommissionBase = 'sales' | 'profit';
export type Employment = 'permanent' | 'fixed';

export interface EmployeeForm {
  photo: string | null;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string; // 9 digits after +998
  birthDate: Date | null;
  gender: Gender;
  code: string;

  branch: string | null;
  multiBranch: boolean;
  extraBranches: string[];
  position: string | null;
  hireDate: Date;
  employment: Employment;
  contractEnd: Date | null;
  probation: boolean;
  probationMonths: number;

  workType: WorkType;
  workDays: number[]; // 0 = Dushanba … 6 = Yakshanba
  startTime: string;
  endTime: string;
  lunchBreak: boolean;
  lunchStart: string;
  lunchEnd: string;
  shifts: string[];
  shiftRotation: ShiftRotation;
  cycleWork: number;
  cycleRest: number;
  cycleStart: Date;
  graceMinutes: number;

  /** Payroll template assigned to the employee. */
  templateId: string | null;
  /** Employee-specific base pay instead of the template amount. */
  baseOverride: boolean;
  baseAmount: number | null;
  /** Template rules switched off for this employee only. */
  disabledRules: string[];
  /** Rules that apply to this employee only. */
  extraRules: PayrollRule[];

  syncDevices: boolean;
}

export type FormErrors = Partial<Record<keyof EmployeeForm, string>>;

export type FormSectionId = 'personal' | 'workplace' | 'schedule' | 'salary';