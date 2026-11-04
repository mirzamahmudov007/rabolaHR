import { messages } from './messages';
import { DEFAULT_LOCALE, type Locale } from './config';

/**
 * Locale-aware lookups that work *outside* React: mock-data helpers, CSV headers and
 * plain formatting utilities resolve strings through here.
 *
 * Message variables are substituted literally (`{count}` -> value); the dictionaries
 * only ever contain U+2019 apostrophes, so no ICU escaping rules are needed.
 */
let current: Locale = DEFAULT_LOCALE;

/** Kept in sync by `LocaleProvider` so module-level helpers see the active language. */
export function setStaticLocale(locale: Locale) {
  current = locale;
}

export function getStaticLocale(): Locale {
  return current;
}

export function lookup(locale: Locale, key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>(
      (acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined),
      messages[locale] as unknown as Record<string, unknown>,
    );
  return typeof value === 'string' ? value : undefined;
}

/** Whole dictionary of the active language. */
export function dict(locale: Locale = current): Record<string, unknown> {
  return messages[locale] as unknown as Record<string, unknown>;
}

/** Translate `key` in the active language, falling back to Uzbek, then to the key itself. */
export function t(key: string, values?: Record<string, string | number>): string {
  const raw = lookup(current, key) ?? lookup(DEFAULT_LOCALE, key);
  if (raw === undefined) return key;
  if (!values) return raw;
  return raw.replace(/\{([^{}]+)\}/g, (whole, name: string) =>
    name in values ? String(values[name]) : whole,
  );
}

export const MONTH_KEYS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
] as const;

/** Monday-first, matching the order the dictionaries and calendars use. */
export const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type MonthKey = (typeof MONTH_KEYS)[number];
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const weekdayKey = (d: Date): WeekdayKey => WEEKDAY_KEYS[(d.getDay() + 6) % 7];

export const monthName = (index: number) => t(`dates.months.${MONTH_KEYS[index]}`);
export const monthNameLower = (index: number) => t(`dates.monthsLower.${MONTH_KEYS[index]}`);
export const monthNames = () => MONTH_KEYS.map((k) => t(`dates.months.${k}`));
export const weekdayName = (d: Date) => t(`dates.weekdays.${weekdayKey(d)}`);
export const weekdayShort = (d: Date) => t(`dates.weekdaysShort.${weekdayKey(d)}`);
export const weekdayShortNames = () => WEEKDAY_KEYS.map((k) => t(`dates.weekdaysShort.${k}`));
/** Two-letter weekday initial, for compact day pickers. */
export const weekdayMin = (d: Date) => t(`dates.weekdaysMin.${weekdayKey(d)}`);
export const weekdayMinNames = () => WEEKDAY_KEYS.map((k) => t(`dates.weekdaysMin.${k}`));
