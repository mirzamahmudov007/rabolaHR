import { TODAY } from '@/shared/utils/date';
import { t, weekdayMinNames } from '@/shared/i18n/static';
import type { WorkType } from '@/shared/types/employee';
import type { EmployeeForm, FormSectionId, PayType } from '@/shared/types/employeeForm';

export const defaultEmployeeForm: EmployeeForm = {
  photo: null,
  firstName: '',
  lastName: '',
  middleName: '',
  phone: '',
  birthDate: null,
  gender: 'male',
  code: 'XD025',
  branch: null,
  multiBranch: false,
  extraBranches: [],
  position: null,
  hireDate: TODAY,
  employment: 'permanent',
  contractEnd: null,
  probation: false,
  probationMonths: 3,
  workType: 'Oddiy',
  workDays: [0, 1, 2, 3, 4],
  startTime: '09:00',
  endTime: '18:00',
  lunchBreak: true,
  lunchStart: '13:00',
  lunchEnd: '14:00',
  shifts: ['day'],
  shiftRotation: 'fixed',
  cycleWork: 2,
  cycleRest: 2,
  cycleStart: TODAY,
  graceMinutes: 10,
  templateId: null,
  baseOverride: false,
  baseAmount: null,
  disabledRules: [],
  extraRules: [],
  syncDevices: true
};

export const probationOptions = [1, 2, 3];

/** Standard full-time week under the Labour Code. */
export const MAX_WEEKLY_HOURS = 40;

/**
 * Option lists carry labels, so they are functions: they read the active language at
 * render time instead of freezing the strings when the module is first imported.
 */
export const formSections = (): {id: FormSectionId;label: string;}[] => [
{ id: 'personal', label: t('create.personal.title') },
{ id: 'workplace', label: t('create.workplace.title') },
{ id: 'schedule', label: t('create.schedule.title') },
{ id: 'salary', label: t('create.salary.title') }];


export const workTypeOptions = (): {value: WorkType;title: string;description: string;}[] => [
{ value: 'Oddiy', title: t('data.workType.Oddiy'), description: t('data.workTypeDesc.Oddiy') },
{ value: 'Smenali', title: t('data.workType.Smenali'), description: t('data.workTypeDesc.Smenali') },
{ value: 'Sikl', title: t('data.workType.Sikl'), description: t('data.workTypeDesc.Sikl') }];


export const payTypeOptions = (): {value: PayType;title: string;description: string;}[] => [
{ value: 'monthly', title: t('data.payType.monthly'), description: t('data.payTypeDesc.monthly') },
{ value: 'hourly', title: t('data.payType.hourly'), description: t('data.payTypeDesc.hourly') },
{ value: 'daily', title: t('data.payType.daily'), description: t('data.payTypeDesc.daily') },
{ value: 'commission', title: t('data.payType.commission'), description: t('data.payTypeDesc.commission') }];


export const shiftOptions = () => [
{ id: 'day', label: t('data.shift.day'), time: '08:00 – 16:00' },
{ id: 'evening', label: t('data.shift.evening'), time: '16:00 – 00:00' },
{ id: 'night', label: t('data.shift.night'), time: '00:00 – 08:00' }];


/** Monday-first two-letter weekday initials. */
export const weekdayLabels = () => weekdayMinNames();

export const graceOptions = [0, 5, 10, 15, 30];


export const overtimeOptions = [1.25, 1.5, 2];

/** Mock positions keep their Uzbek source string as the stored value. */
const POSITION_KEYS: {value: string;key: string;}[] = [
{ value: 'Bosh dasturchi', key: 'leadDev' },
{ value: 'Frontend dasturchi', key: 'frontend' },
{ value: 'Backend dasturchi', key: 'backend' },
{ value: 'HR menejer', key: 'hr' },
{ value: 'Buxgalter', key: 'accountant' },
{ value: 'Kassir', key: 'cashier' },
{ value: 'Operator', key: 'operator' },
{ value: 'Sotuv menejeri', key: 'sales' },
{ value: 'Omborchi', key: 'storekeeper' },
{ value: 'Haydovchi', key: 'driver' },
{ value: 'Xavfsizlik xodimi', key: 'security' },
{ value: 'Texnik mutaxassis', key: 'technician' },
{ value: 'Tizim administratori', key: 'sysadmin' },
{ value: 'Filial rahbari', key: 'branchHead' },
{ value: 'Marketolog', key: 'marketer' },
{ value: 'Dizayner', key: 'designer'}];


export const positionOptions = () =>
POSITION_KEYS.map((p) => ({ value: p.value, label: t(`data.position.${p.key}`) }));