export type RuleKind = 'penalty' | 'bonus';

export type RuleTrigger =
'late' |
'early_leave' |
'absent' |
'overtime' |
'holiday_work' |
'night_shift' |
'perfect_month' |
'sales_plan';

export type RuleCalc = 'fixed' | 'per_unit' | 'percent' | 'tiered';

export interface RuleTier {
  from: number;
  amount: number;
}

export interface PayrollRule {
  id: string;
  name: string;
  kind: RuleKind;
  trigger: RuleTrigger;
  /** Minutes / hours / percent depending on the trigger. */
  threshold: number;
  /** First N occurrences per month are forgiven. */
  freeTimes: number;
  calc: RuleCalc;
  /** Sum in so'm, or percent when calc = percent. */
  amount: number;
  tiers: RuleTier[];
  monthlyCap: number | null;
  active: boolean;
}

export type PayBase = 'monthly' | 'hourly' | 'daily' | 'commission';

export interface PayTemplate {
  id: string;
  name: string;
  description: string;
  payType: PayBase;
  amount: number;
  commissionPercent: number | null;
  ruleIds: string[];
  /** Auto-suggest for these positions / branches. Empty branches = all branches. */
  positions: string[];
  branches: string[];
}