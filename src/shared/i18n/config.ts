/**
 * The four languages the interface ships with.
 * `uz` is Latin Uzbek (the default), `uz-Cyrl` is Cyrillic Uzbek, plus Russian and English.
 */
export const LOCALES = ['uz', 'uz-Cyrl', 'ru', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

/** Remembered across reloads; read on the server so the first paint is already in the right language. */
export const LOCALE_COOKIE = 'att-locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Names as a speaker expects to read them — never translated. */
export const localeNames: Record<Locale, string> = {
  uz: "O'zbekcha (Lotin)",
  'uz-Cyrl': "O'zbekcha (Kirill)",
  ru: 'Русский',
  en: 'English'
};

/** Short label for the collapsed switcher trigger. */
export const localeShortNames: Record<Locale, string> = {
  uz: "O'zbekcha",
  'uz-Cyrl': 'Ўзбекча',
  ru: 'Русский',
  en: 'English'
};

/** Value written to `<html lang>`. */
export const htmlLang: Record<Locale, string> = {
  uz: 'uz-Latn-UZ',
  'uz-Cyrl': 'uz-Cyrl-UZ',
  ru: 'ru',
  en: 'en'
};

/** BCP-47 tag handed to Intl / next-intl for dates, numbers and plural rules. */
export const intlLocale: Record<Locale, string> = {
  uz: 'uz-UZ',
  'uz-Cyrl': 'uz-Cyrl-UZ',
  ru: 'ru-RU',
  en: 'en-GB'
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
