import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  getDay,
  isAfter,
  isSameDay,
  startOfMonth } from
'date-fns';
import { TODAY, formatDayLong, formatMonthYear } from '@/shared/utils/date';
import { t } from '@/shared/i18n/static';
import { text } from '@/shared/i18n/glossary';
import { statusMeta } from '@/shared/data/attendanceStatuses';
import { shiftLengthHours, formatMoney } from '@/shared/utils/employeeForm';
import type { AttendanceStatus, Employee, WorkType } from '@/shared/types/employee';

/** A calendar-day state: a real attendance status, a day off (or before hire), or a day that hasn't happened yet. */
export type DayStatus = AttendanceStatus | 'off' | 'future';

/**
 * How each day state is named and coloured in the davomat table and the day dialog.
 * "Ta’til" is used instead of the shared "Dam olishda" so a leave day can't be read as a day off.
 * `text` is read at render time, so it follows the language currently being displayed.
 */
export const dayState: Record<DayStatus, {cls: string;readonly text: string;}> = {
  present: { cls: statusMeta.present.badgeClass, get text() {return t('data.dayState.present');} },
  late: { cls: statusMeta.late.badgeClass, get text() {return t('data.dayState.late');} },
  absent: { cls: statusMeta.absent.badgeClass, get text() {return t('data.dayStateShort.absent');} },
  leave: { cls: statusMeta.leave.badgeClass, get text() {return t('data.dayState.leave');} },
  off: { cls: 'bg-type-regular-soft text-type-regular-ink', get text() {return t('data.dayState.off');} },
  future: { cls: 'bg-surface-2 text-subtle', get text() {return t('data.dayState.future');} }
};

/** "8 soat 24 daqiqa" — two units read faster than a decimal hour. */
export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (!h) return t('common.duration.m', { m });
  return m ? t('common.duration.hm', { h, m }) : t('common.duration.h', { h });
}

/** One line of the money breakdown: what was counted, the arithmetic, and the result. */
export interface CalcStep {label: string;formula: string;amount: number;}

/** Everything the day-detail modal needs to explain where the money comes from. */
export interface DayCalc {
workType: WorkType;offRule: string;
/** monthly contract base and how many workdays it is spread over */monthlyBase: number;expectedWorkdays: number;
/** one day's base and one minute's worth of it */dailyBase: number;perMinute: number;
/** scheduled minutes, plus the unpaid break deducted for regular days */targetMin: number;breakMin: number;workedMin: number;
bonusSteps: CalcStep[];fineSteps: CalcStep[];
/** plain-language reason for the day's state */note: string;}

/** A manually corrected clock entry for one day. */
export interface TimeOverride {checkIn?: string;checkOut?: string;}

export interface DayRecord {
day: Date;status: DayStatus;shiftLabel?: string;
/** scheduled clock times */reqIn?: string;reqOut?: string;
/** actual clock times */checkIn?: string;checkOut?: string;
/** deviation minutes: penalty (late in / early out) and bonus (early in / overtime) */lateIn?: number;earlyIn?: number;overtime?: number;earlyOut?: number;
lateMinutes?: number;hours?: number;
/** money, so'm — base = the day's scheduled salary before bonus/fine */base?: number;bonus?: number;fine?: number;pay?: number;
/** true when the clock times were entered by hand instead of coming from the camera */manual?: boolean;
/** full explanation of the day's money */calc: DayCalc;}


export interface MonthStats {
present: number;late: number;absent: number;leave: number;
workdays: number;totalHours: number;avgCheckIn: string;avgCheckOut: string;
onTimeRate: number;attendanceRate: number;totalLateMin: number;totalOvertime: number;
totalPay: number;totalBonus: number;totalFine: number;}


// ── deterministic pseudo-random (stable per employee + date) ──
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {h ^= str.charCodeAt(i);h = Math.imul(h, 16777619);}
  return h >>> 0;
}
function rand(seed: string): number {
  let a = hash(seed);
  a |= 0;a = a + 0x6d2b79f5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
/** Key of a day inside the manual-time overrides map. */
export const timeKey = dayKey;
const toMin = (t: string) => {const [h, m] = t.split(':').map(Number);return h * 60 + m;};
const fmtClock = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const parseJoined = (iso: string) => {const [y, m, d] = iso.split('-').map(Number);return new Date(y, m - 1, d);};

interface Sched {inStr: string;outStr: string;startMin: number;endMin: number;targetMin: number;}
function scheduleOf(e: Employee): Sched {
  const m = e.workHours.match(/(\d{1,2}:\d{2}).*?(\d{1,2}:\d{2})/);
  const inStr = m ? m[1] : '09:00';
  const outStr = m ? m[2] : '18:00';
  // shiftLengthHours handles overnight / 24h shifts (08:00 – 08:00 → 24h)
  const targetMin = Math.round(shiftLengthHours(inStr, outStr, 0) * 60);
  return { inStr, outStr, startMin: toMin(inStr), endMin: toMin(outStr), targetMin: targetMin || 540 };
}

interface Cfg {sched: Sched;joined: Date;on: number;rest: number;offKey: string;}
function buildCfg(e: Employee): Cfg {
  let on = 0, rest = 0;
  if (e.workType === 'Sikl') {
    const m = e.workTypeNote.match(/(\d+)\s*kun ish.*?(\d+)\s*kun dam/);
    on = m ? +m[1] : 6;rest = m ? +m[2] : 1;
  }
  // Off-day rule differs per work type — shown as-is in the day detail modal.
  const offKey =
  e.workType === 'Oddiy' ?
  /Shanba/.test(e.workTypeNote) ? 'calc.off.sun' : 'calc.off.satSun' :
  e.workType === 'Smenali' ? 'calc.off.shift' :
  'calc.off.cycle';
  return { sched: scheduleOf(e), joined: parseJoined(e.joined), on, rest, offKey };
}

/** Message string for the cfg's day-off rule, with the cycle numbers filled in. */
const offRuleText = (cfg: Cfg) =>
t(cfg.offKey, cfg.offKey === 'calc.off.cycle' ? { on: cfg.on, rest: cfg.rest } : undefined);

function shiftLabel(e: Employee): string | undefined {
  if (e.workType === 'Smenali') return text(e.workTypeNote.replace(' smena', '').trim());
  if (e.workType === 'Sikl') {
    const m = e.workTypeNote.match(/(\d+)\s*kun ish.*?(\d+)\s*kun dam/);
    return m ? t('calc.cycleShift', { on: m[1], rest: m[2] }) : t('data.workType.Sikl');
  }
  return undefined;
}

function isOffDay(e: Employee, day: Date, cfg: Cfg): boolean {
  if (day.getTime() < cfg.joined.getTime()) return true; // not employed yet
  const wd = getDay(day);
  if (e.workType === 'Oddiy') return wd === 0 || (wd === 6 && !/Shanba/.test(e.workTypeNote));
  if (e.workType === 'Smenali') return wd === 0;
  const len = cfg.on + cfg.rest;
  const pos = ((differenceInCalendarDays(day, cfg.joined) % len) + len) % len;
  return pos >= cfg.on;
}

interface Money {dailyBase: number;perMinute: number;monthlyBase: number;expectedWorkdays: number;}
function buildDay(e: Employee, day: Date, cfg: Cfg, money: Money, label?: string, ov?: TimeOverride): DayRecord {
  const { sched } = cfg;
  const offRule = offRuleText(cfg);
  // Regular days include an unpaid lunch hour; shifts and cycles are paid wall-clock.
  const breakMin = e.workType === 'Oddiy' ? 60 : 0;
  const calc: DayCalc = {
    workType: e.workType, offRule,
    monthlyBase: money.monthlyBase, expectedWorkdays: money.expectedWorkdays,
    dailyBase: money.dailyBase, perMinute: money.perMinute,
    targetMin: sched.targetMin, breakMin, workedMin: 0,
    bonusSteps: [], fineSteps: [], note: ''
  };
  const common = { day, shiftLabel: label, reqIn: sched.inStr, reqOut: sched.outStr, base: money.dailyBase, bonus: 0, fine: 0, pay: 0, calc };

  if (isAfter(day, TODAY)) {
    return { ...common, status: 'future', base: 0, calc: { ...calc, note: t('calc.noteFuture') } };
  }
  if (isOffDay(e, day, cfg)) {
    return {
      ...common, status: 'off', reqIn: undefined, reqOut: undefined, base: 0,
      calc: { ...calc, note: t('calc.noteOff', { rule: offRule }) }
    };
  }

  const r = rand(`${e.code}|${dayKey(day)}|st`);
  if (r < 0.04) {
    return { ...common, status: 'absent', calc: { ...calc, note: t('calc.noteAbsent') } };
  }
  if (r < 0.09) {
    return { ...common, status: 'leave', pay: money.dailyBase, calc: { ...calc, note: t('calc.noteLeave') } };
  }

  // arrived — deterministic deviations, unless the times were corrected by hand
  const inOverride = ov?.checkIn ? toMin(ov.checkIn) : null;
  const outOverride = ov?.checkOut ? toMin(ov.checkOut) : null;
  const manual = inOverride !== null || outOverride !== null;
  const devIn = inOverride !== null ? inOverride - sched.startMin : Math.round(rand(`${e.code}|${dayKey(day)}|in`) * 46 - 12); // -12..+34 min vs required start
  const devOut = outOverride !== null ? outOverride - sched.endMin : Math.round(rand(`${e.code}|${dayKey(day)}|out`) * 42 - 12); // -12..+30 min vs required end
  const checkIn = fmtClock(sched.startMin + devIn);
  const checkOut = fmtClock(sched.endMin + devOut);
  const lateIn = Math.max(0, devIn), earlyIn = Math.max(0, -devIn);
  const overtime = Math.max(0, devOut), earlyOut = Math.max(0, -devOut);
  const workedMin = Math.max(0, sched.targetMin + devOut - devIn);
  // Money is derived from the SAME rounded rate the modal prints, so the shown
  // arithmetic (minutes × rate) always adds up to the shown amount.
  const rate = Math.round(money.perMinute);

  // Bonus / fine are itemised so the modal can show the exact arithmetic.
  const bonusSteps: CalcStep[] = [];
  if (earlyIn >= 10) {
    bonusSteps.push({
      label: t('calc.bonus.earlyLabel'),
      formula: t('calc.bonus.earlyFormula', { min: earlyIn, base: formatMoney(money.dailyBase) }),
      amount: Math.round(money.dailyBase * 0.02)
    });
  }
  if (overtime >= 15) {
    bonusSteps.push({
      label: t('calc.bonus.overtimeLabel'),
      formula: t('calc.bonus.overtimeFormula', { min: overtime, rate: t('common.moneyPerMinute', { amount: formatMoney(rate) }) }),
      amount: Math.round(overtime * rate * 1.5)
    });
  }
  const fineSteps: CalcStep[] = [];
  if (lateIn > 0) {
    fineSteps.push({
      label: t('calc.fine.lateLabel'),
      formula: t('calc.fine.formula', { min: lateIn, rate: t('common.moneyPerMinute', { amount: formatMoney(rate) }) }),
      amount: lateIn * rate
    });
  }
  if (earlyOut > 0) {
    fineSteps.push({
      label: t('calc.fine.earlyOutLabel'),
      formula: t('calc.fine.formula', { min: earlyOut, rate: t('common.moneyPerMinute', { amount: formatMoney(rate) }) }),
      amount: earlyOut * rate
    });
  }
  const bonus = bonusSteps.reduce((s, x) => s + x.amount, 0);
  const fine = fineSteps.reduce((s, x) => s + x.amount, 0);
  const pay = Math.max(0, money.dailyBase + bonus - fine);

  const reasons: string[] = [];
  if (lateIn > 0) reasons.push(t('calc.reason.lateIn', { min: lateIn }));
  if (earlyOut > 0) reasons.push(t('calc.reason.earlyOut', { min: earlyOut }));
  if (earlyIn >= 10) reasons.push(t('calc.reason.earlyIn', { min: earlyIn }));
  if (overtime >= 15) reasons.push(t('calc.reason.overtime', { min: overtime }));
  const baseNote = reasons.length ?
  t('calc.noteReasons', { reasons: reasons.join(', ') }) :
  t('calc.noteClean');
  const note = manual ?
  t('calc.noteManual', { inOut: `${checkIn}–${checkOut}`, note: baseNote }) : baseNote;

  return {
    ...common,
    status: lateIn > 0 ? 'late' : 'present',
    checkIn, checkOut,
    lateIn, earlyIn, overtime, earlyOut,
    lateMinutes: lateIn,
    hours: Math.round((workedMin / 60 - (breakMin ? 1 : 0)) * 10) / 10,
    bonus, fine, pay,
    manual: manual || undefined,
    calc: { ...calc, workedMin, bonusSteps, fineSteps, note }
  };
}

/** How the month's salary is split: base per workday and per scheduled minute. */
function monthMoney(e: Employee, month: Date, cfg: Cfg): Money {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const expected = days.filter((d) => !isOffDay(e, d, cfg)).length;
  const monthly = 6_000_000 + (hash(e.code) % 19) * 1_000_000; // synthetic base salary
  const dailyBase = expected ? Math.round(monthly / expected) : 0;
  return { dailyBase, perMinute: cfg.sched.targetMin ? dailyBase / cfg.sched.targetMin : 0, monthlyBase: monthly, expectedWorkdays: expected };
}

/** All calendar days of `month` with a per-day attendance + payroll record. */
export function buildMonth(e: Employee, month: Date, overrides?: Record<string, TimeOverride>): DayRecord[] {
  const cfg = buildCfg(e);
  const money = monthMoney(e, month, cfg);
  const label = shiftLabel(e);
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  return days.map((d) => buildDay(e, d, cfg, money, label, overrides?.[dayKey(d)]));
}

/** One day recomputed with a candidate manual entry — used to preview the effect before saving. */
export function previewDay(e: Employee, month: Date, day: Date, times: TimeOverride): DayRecord {
  const cfg = buildCfg(e);
  return buildDay(e, day, cfg, monthMoney(e, month, cfg), shiftLabel(e), times);
}

/** Summary over the elapsed (non-off, non-future) days of a month. */
export function summarize(records: DayRecord[]): MonthStats {
  let present = 0, late = 0, absent = 0, leave = 0, hours = 0, inSum = 0, inCount = 0;
  let outSum = 0, outCount = 0, lateMin = 0, overtimeMin = 0;
  let totalPay = 0, totalBonus = 0, totalFine = 0;
  for (const r of records) {
    if (r.status === 'present') present++;
    if (r.status === 'late') late++;
    if (r.status === 'absent') absent++;
    if (r.status === 'leave') leave++;
    totalPay += r.pay ?? 0;
    totalBonus += r.bonus ?? 0;
    totalFine += r.fine ?? 0;
    if (r.status === 'present' || r.status === 'late') {
      hours += r.hours ?? 0;
      lateMin += r.lateIn ?? 0;
      overtimeMin += r.overtime ?? 0;
      if (r.checkIn) {inSum += toMin(r.checkIn);inCount++;}
      if (r.checkOut) {outSum += toMin(r.checkOut);outCount++;}
    }
  }
  const arrived = present + late;
  const workdays = arrived + absent + leave;
  return {
    present, late, absent, leave,
    workdays,
    totalHours: Math.round(hours * 10) / 10,
    avgCheckIn: inCount ? fmtClock(Math.round(inSum / inCount)) : '—',
    avgCheckOut: outCount ? fmtClock(Math.round(outSum / outCount)) : '—',
    onTimeRate: arrived ? Math.round(present / arrived * 100) : 0,
    attendanceRate: workdays ? Math.round(arrived / workdays * 100) : 0,
    totalLateMin: lateMin, totalOvertime: overtimeMin,
    totalPay, totalBonus, totalFine
  };
}

/** `Oktabr 2026` in the active language. */
export const monthLabel = (d: Date) => formatMonthYear(d);

/** `12-oktabr, dushanba` — day-detail modal title. */
export const dayLabel = (d: Date) => formatDayLong(d);

/** Paid time of a day, break excluded — '—' when the day carries no clock record. */
export const workedLabel = (r: DayRecord) => {
  const min = (r.calc.workedMin || 0) - (r.calc.breakMin || 0);
  return min > 0 ? fmtDuration(min) : '—';
};

/** Derived contact details for the prototype (not stored on the Employee model). */
export function employeeContact(e: Employee): {email: string;phone: string;} {
  const slug = e.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  const p = String(hash(e.code) % 90000000 + 90000000);
  return { email: `${slug}@att.uz`, phone: `+998 ${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7, 9)}` };
}

export { isSameDay as sameDay, TODAY };
