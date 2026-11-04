import { differenceInCalendarDays, isSameDay } from 'date-fns';
import {
  monthName,
  monthNameLower,
  pad2,
  t,
  weekdayMin,
  weekdayName,
  weekdayShort,
} from '@/shared/i18n/static';

/** Month names of the active language, January first. */
export { monthNames, weekdayMinNames, weekdayShortNames } from '@/shared/i18n/static';

/** Fixed "today" for the prototype data set. */
export const TODAY = new Date(2026, 9, 26);

/** Numeric date: `26.10.2026` in Uzbek/Russian, `10/26/2026` in English. */
export const formatDate = (d: Date) =>
  t('dates.dateNumeric', { day: pad2(d.getDate()), month: pad2(d.getMonth() + 1), year: d.getFullYear() });

/** Same, for the ISO dates stored in the mock data (`2026-10-23`). */
export const formatIso = (iso: string) => formatDate(new Date(`${iso}T00:00:00`));

/** Short day label used by the attendance tables: `26-oktabr` / `26 октября` / `October 26`. */
export const formatDay = (d: Date) =>
  t('dates.dayMonthLower', {
    day: d.getDate(),
    monthLower: monthNameLower(d.getMonth()),
    month: monthName(d.getMonth()),
  });

export const formatMonthYear = (d: Date) =>
  t('dates.monthYear', { month: monthName(d.getMonth()), year: d.getFullYear() });

/** `Dushanba, 26` style cell header for the attendance table. */
export const formatWeekdayDay = (d: Date) =>
  t('dates.weekdayDay', { weekday: weekdayShort(d), day: d.getDate() });

/** Table row header: `26.10`. */
export const formatDayNum = (d: Date) =>
  t('dates.dayMonth', { day: pad2(d.getDate()), month: pad2(d.getMonth() + 1) });

/** Dialog title: `12-oktabr, dushanba` / `12 октября, вторник` / `October 12, Tuesday`. */
export const formatDayLong = (d: Date) =>
  t('dates.dayMonthLong', {
    day: d.getDate(),
    monthLower: monthNameLower(d.getMonth()),
    month: monthName(d.getMonth()),
    weekday: weekdayName(d),
    year: d.getFullYear(),
  });

/** Two-letter weekday of the active language, for the cycle preview strip. */
export const formatWeekdayMin = (d: Date) => weekdayMin(d);

export function formatRange(from: Date, to: Date | null): string {
  if (!to || isSameDay(from, to)) return formatDate(from);
  return t('common.range', { from: formatDate(from), to: formatDate(to) });
}

export function rangeLength(from: Date, to: Date | null): number {
  return to ? Math.abs(differenceInCalendarDays(to, from)) + 1 : 1;
}

/** `12 kun` / `12 дн.` / `12 days`. */
export const formatDays = (count: number) => t('dates.days', { count });
