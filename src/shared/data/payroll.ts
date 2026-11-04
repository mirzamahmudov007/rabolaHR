import type { PayTemplate, PayrollRule } from '@/shared/types/payroll';

export const initialRules: PayrollRule[] = [
{
  id: 'r-late',
  name: 'Kechikish jarimasi',
  kind: 'penalty',
  trigger: 'late',
  threshold: 10,
  freeTimes: 2,
  calc: 'tiered',
  amount: 20000,
  tiers: [
  { from: 10, amount: 20000 },
  { from: 30, amount: 50000 },
  { from: 60, amount: 100000 }],

  monthlyCap: 300000,
  active: true
},
{ id: 'r-early', name: 'Erta ketish', kind: 'penalty', trigger: 'early_leave', threshold: 15, freeTimes: 0, calc: 'fixed', amount: 30000, tiers: [], monthlyCap: null, active: true },
{ id: 'r-absent', name: 'Sababsiz kelmaslik', kind: 'penalty', trigger: 'absent', threshold: 0, freeTimes: 0, calc: 'percent', amount: 5, tiers: [], monthlyCap: null, active: true },
{ id: 'r-overtime', name: 'Qo‘shimcha soat to‘lovi', kind: 'bonus', trigger: 'overtime', threshold: 1, freeTimes: 0, calc: 'per_unit', amount: 40000, tiers: [], monthlyCap: 1000000, active: true },
{ id: 'r-holiday', name: 'Bayram kuni ishlash', kind: 'bonus', trigger: 'holiday_work', threshold: 0, freeTimes: 0, calc: 'per_unit', amount: 150000, tiers: [], monthlyCap: null, active: true },
{ id: 'r-night', name: 'Tungi smena ustamasi', kind: 'bonus', trigger: 'night_shift', threshold: 0, freeTimes: 0, calc: 'per_unit', amount: 15000, tiers: [], monthlyCap: null, active: true },
{ id: 'r-perfect', name: 'Intizom bonusi', kind: 'bonus', trigger: 'perfect_month', threshold: 0, freeTimes: 0, calc: 'fixed', amount: 300000, tiers: [], monthlyCap: null, active: true },
{ id: 'r-sales', name: 'Reja bajarilishi', kind: 'bonus', trigger: 'sales_plan', threshold: 100, freeTimes: 0, calc: 'percent', amount: 10, tiers: [], monthlyCap: null, active: false }];


export const initialTemplates: PayTemplate[] = [
{
  id: 'tpl-office',
  name: 'Ofis xodimlari',
  description: 'Belgilangan oylik, kechikish va erta ketish uchun jarima, intizom bonusi',
  payType: 'monthly',
  amount: 6000000,
  commissionPercent: null,
  ruleIds: ['r-late', 'r-early', 'r-absent', 'r-perfect'],
  positions: ['HR menejer', 'Buxgalter', 'Bosh dasturchi', 'Frontend dasturchi', 'Backend dasturchi', 'Marketolog', 'Dizayner'],
  branches: []
},
{
  id: 'tpl-hourly',
  name: 'Kassirlar — smenali',
  description: 'Soatbay to‘lov, tungi va qo‘shimcha soatlar uchun ustama',
  payType: 'hourly',
  amount: 30000,
  commissionPercent: null,
  ruleIds: ['r-late', 'r-absent', 'r-overtime', 'r-night'],
  positions: ['Kassir', 'Operator'],
  branches: []
},
{
  id: 'tpl-sales',
  name: 'Sotuv bo‘limi',
  description: 'Oklad + savdodan ulush, rejani bajarganlik uchun bonus',
  payType: 'commission',
  amount: 3500000,
  commissionPercent: 5,
  ruleIds: ['r-late', 'r-perfect', 'r-sales'],
  positions: ['Sotuv menejeri'],
  branches: []
},
{
  id: 'tpl-daily',
  name: 'Xavfsizlik va haydovchilar',
  description: 'Kunbay to‘lov, bayram va tungi ish uchun qo‘shimcha',
  payType: 'daily',
  amount: 250000,
  commissionPercent: null,
  ruleIds: ['r-absent', 'r-holiday', 'r-night'],
  positions: ['Xavfsizlik xodimi', 'Haydovchi', 'Omborchi'],
  branches: []
},
{
  id: 'tpl-managers',
  name: 'Rahbarlar va texnik xodimlar',
  description: 'Yuqori oylik, faqat sababsiz kelmaslik uchun jarima',
  payType: 'monthly',
  amount: 12000000,
  commissionPercent: null,
  ruleIds: ['r-absent', 'r-overtime'],
  positions: ['Filial rahbari', 'Tizim administratori', 'Texnik mutaxassis'],
  branches: []
}];