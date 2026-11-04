'use client';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, isLocale } from './config';
import type { Locale } from './config';
import { messages } from './messages';
import { setStaticLocale } from './static';

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const Ctx = createContext<LocaleCtx | null>(null);

/** Client-side locale state + next-intl provider. Locale survives reloads via a cookie. */
export function LocaleProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  // Module-level helpers (mock data, plain date formatters) read the language from
  // `static.ts`, so it is pinned here before any child renders.
  setStaticLocale(locale);

  const setLocale = useCallback((l: Locale) => {
    if (!isLocale(l)) return;
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
    document.documentElement.lang = l === 'uz' ? 'uz-Latn-UZ' : l === 'uz-Cyrl' ? 'uz-Cyrl-UZ' : l;
    setLocaleState(l);
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <Ctx.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </Ctx.Provider>
  );
}

export function useLocaleCtx(): LocaleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocaleCtx must be used inside <LocaleProvider>');
  return ctx;
}
