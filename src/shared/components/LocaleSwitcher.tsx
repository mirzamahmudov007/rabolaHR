'use client';
import React, { useRef, useState } from 'react';
import { CheckIcon, GlobeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LOCALES, localeShortNames } from '@/shared/i18n/config';
import { useLocaleCtx } from '@/shared/i18n/LocaleProvider';
import { useDismiss } from '@/shared/hooks/useDismiss';

/** Globe dropdown in the TopBar: switches language instantly, no reload. */
export function LocaleSwitcher() {
  const { locale, setLocale } = useLocaleCtx();
  const t = useTranslations('topbar');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t('languageAria')}
        title={t('language')}
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-body text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">

        <GlobeIcon className="h-[18px] w-[18px]" aria-hidden />
        <span className="hidden text-xs font-semibold md:block">{localeShortNames[locale]}</span>
      </button>

      {open &&
        <div className="absolute right-0 top-full z-40 mt-1.5 w-44 rounded-xl border border-line bg-surface p-1 shadow-lg">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
            {t('language')}
          </div>
          {LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => { setLocale(code); setOpen(false); }}
              aria-current={code === locale}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors duration-150 ${code === locale
                ? 'bg-brand-soft text-ink'
                : 'text-body hover:bg-canvas hover:text-ink'}`}>
              
              <span>{localeShortNames[code]}</span>
              {code === locale && <CheckIcon className="h-4 w-4" aria-hidden />}
            </button>
          ))}
        </div>
      }
    </div>);

}
