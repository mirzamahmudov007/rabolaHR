import type { RuleCalc, RuleKind, RuleTrigger } from '@/shared/types/payroll';

export type TriggerMode = 'event' | 'quantity' | 'once';

export interface TriggerMeta {
  label: string;
  group: string;
  kind: RuleKind;
  mode: TriggerMode;
  /** Unit name used in "har ... uchun". */
  unit: string;
  /** Label shown next to the threshold input; null = no threshold. */
  thresholdLabel: string | null;
  thresholdUnit: string;
  calcs: RuleCalc[];
  /** Example value used in the live preview. */
  sample: {count: number;value: number;text: string;};
}

export const triggerMeta: Record<RuleTrigger, TriggerMeta> = {
  late: {
    label: 'Kechikish',
    group: 'Davomat',
    kind: 'penalty',
    mode: 'event',
    unit: 'daqiqa',
    thresholdLabel: 'Necha daqiqadan ko‘p kechiksa',
    thresholdUnit: 'daqiqa',
    calcs: ['fixed', 'tiered', 'per_unit', 'percent'],
    sample: { count: 4, value: 25, text: 'oyda 4 marta, har safar 25 daqiqa kechiksa' }
  },
  early_leave: {
    label: 'Erta ketish',
    group: 'Davomat',
    kind: 'penalty',
    mode: 'event',
    unit: 'daqiqa',
    thresholdLabel: 'Necha daqiqa oldin ketsa',
    thresholdUnit: 'daqiqa',
    calcs: ['fixed', 'tiered', 'per_unit', 'percent'],
    sample: { count: 2, value: 40, text: 'oyda 2 marta, 40 daqiqa erta ketsa' }
  },
  absent: {
    label: 'Sababsiz kelmaslik',
    group: 'Davomat',
    kind: 'penalty',
    mode: 'event',
    unit: 'kun',
    thresholdLabel: null,
    thresholdUnit: '',
    calcs: ['fixed', 'percent'],
    sample: { count: 1, value: 1, text: 'oyda 1 kun sababsiz kelmasa' }
  },
  overtime: {
    label: 'Qo‘shimcha ish soati',
    group: 'Ish vaqti',
    kind: 'bonus',
    mode: 'quantity',
    unit: 'soat',
    thresholdLabel: 'Kamida necha soat',
    thresholdUnit: 'soat',
    calcs: ['per_unit', 'fixed'],
    sample: { count: 1, value: 6, text: 'oyda jami 6 soat ortiqcha ishlasa' }
  },
  holiday_work: {
    label: 'Dam olish / bayram kuni ishlash',
    group: 'Ish vaqti',
    kind: 'bonus',
    mode: 'quantity',
    unit: 'kun',
    thresholdLabel: null,
    thresholdUnit: '',
    calcs: ['per_unit', 'percent'],
    sample: { count: 1, value: 2, text: 'oyda 2 ta bayram kuni ishlasa' }
  },
  night_shift: {
    label: 'Tungi soatlarda ishlash',
    group: 'Ish vaqti',
    kind: 'bonus',
    mode: 'quantity',
    unit: 'soat',
    thresholdLabel: null,
    thresholdUnit: '',
    calcs: ['per_unit', 'fixed'],
    sample: { count: 1, value: 40, text: 'oyda jami 40 soat tunda ishlasa' }
  },
  perfect_month: {
    label: 'Oy davomida kechikmaslik',
    group: 'Natija',
    kind: 'bonus',
    mode: 'once',
    unit: 'oy',
    thresholdLabel: null,
    thresholdUnit: '',
    calcs: ['fixed', 'percent'],
    sample: { count: 1, value: 1, text: 'oy davomida birorta ham kechikmasa' }
  },
  sales_plan: {
    label: 'Savdo rejasini bajarish',
    group: 'Natija',
    kind: 'bonus',
    mode: 'once',
    unit: 'oy',
    thresholdLabel: 'Reja necha foizdan ko‘p bajarilsa',
    thresholdUnit: '%',
    calcs: ['percent', 'fixed'],
    sample: { count: 1, value: 120, text: 'rejani 120% bajarsa' }
  }
};

export const calcLabels: Record<RuleCalc, string> = {
  fixed: 'Qat’iy summa',
  per_unit: 'Birlik uchun',
  percent: 'Okladdan %',
  tiered: 'Pog‘onali'
};

export const kindMeta: Record<RuleKind, {label: string;plural: string;badge: string;dot: string;sign: string;}> = {
  penalty: { label: 'Jarima', plural: 'Jarimalar', badge: 'bg-absent-soft text-absent-ink', dot: 'bg-absent', sign: '−' },
  bonus: { label: 'Bonus', plural: 'Bonuslar', badge: 'bg-present-soft text-present-ink', dot: 'bg-present', sign: '+' }
};