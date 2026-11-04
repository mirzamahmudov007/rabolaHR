'use client';
import { useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { intlLocale } from '@/shared/i18n/config';
import type { Locale } from '@/shared/i18n/config';
import { glossValue } from '@/shared/i18n/glossary';
import {
  formatDay,
  formatDays,
  formatDate,
  formatIso,
  formatMonthYear,
  formatRange,
  formatWeekdayDay,
  monthNames,
  weekdayShortNames,
} from '@/shared/utils/date';

export { MONTH_KEYS, WEEKDAY_KEYS, pad2, weekdayKey } from '@/shared/i18n/static';
export type { MonthKey, WeekdayKey } from '@/shared/i18n/static';
import { MONTH_KEYS, weekdayKey, type MonthKey } from '@/shared/i18n/static';
import { t as tStatic } from '@/shared/i18n/static';

/** Locale-aware date pieces built from the `dates.*` namespaces. */
export function useDateLocale() {
  const locale = useLocale() as Locale;
  const t = useTranslations('dates');

  return useCallback((d: Date) => {
    const monthKey: MonthKey = MONTH_KEYS[d.getMonth()];
    return {
      day: String(d.getDate()).padStart(2, '0'),
      monthNum: String(d.getMonth() + 1).padStart(2, '0'),
      year: d.getFullYear(),
      month: t(`months.${monthKey}`),
      monthLower: t(`monthsLower.${monthKey}`),
      weekday: t(`weekdays.${weekdayKey(d)}`),
      weekdayShort: t(`weekdaysShort.${weekdayKey(d)}`),
      locale: intlLocale[locale],
    };
  }, [t, locale]);
}

/**
 * Plain date formatters as a stable object. Using the hook subscribes the component
 * to the language context, so the strings produced by the module-level helpers are
 * recomputed the moment the language changes.
 */
export function useDateFmt() {
  useLocale();
  return useMemo(
    () => ({
      formatDate,
      formatIso,
      formatDay,
      formatMonthYear,
      formatWeekdayDay,
      formatRange,
      formatDays,
      monthNames,
      weekdayShortNames,
      fmt: tStatic,
    }),
    [],
  );
}

/** `g()` translates a mock-data literal (branch, position, status…); `f()` a message key. */
export function useGloss() {
  const locale = useLocale() as Locale;
  const g = useCallback((value: string) => glossValue(locale, value), [locale]);
  const f = useCallback(
    (key: string, values?: Record<string, string | number>) => tStatic(key, values),
    // `locale` is what actually invalidates the result.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );
  return useMemo(() => ({ g, f, locale }), [g, f, locale]);
}

/** ICU-based duration: "8 soat 37 daqiqa" / "8 ч 37 мин" / "8 hr 37 min". */
export function useFmtDuration() {
  const t = useTranslations('common.duration');
  return useCallback((minutes: number) => {
    const mins = Math.max(0, Math.round(minutes));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (!h) return t('m', { m });
    if (!m) return t('h', { h });
    return t('hm', { h, m });
  }, [t]);
}

/** Locale-aware money: grouped number + currency word, e.g. "86 262 so’m". */
export function useFmtMoney() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  return useCallback((amount: number) => {
    const value = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 })
      .format(Math.round(amount))
      .replace(/\u00a0/g, ' ');
    return t('money', { amount: value });
  }, [t, locale]);
}
