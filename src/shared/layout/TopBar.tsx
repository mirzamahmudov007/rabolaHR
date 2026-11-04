'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDownIcon, MoonIcon, ScanFaceIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/shared/hooks/useTheme';
import { LocaleSwitcher } from '@/shared/components/LocaleSwitcher';
import { useDateLocale } from '@/shared/i18n/format';
import { TODAY } from '@/shared/utils/date';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('topbar');
  const d = useDateLocale();
  const parts = d(TODAY);
  const isDark = theme === 'dark';
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-on-brand lg:hidden">
          <ScanFaceIcon className="h-5 w-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <div className="text-base font-semibold tracking-tight text-ink">{title}</div>
          <div className="text-xs text-muted">
            {t('currentDate', { weekday: parts.weekday, day: parts.day, month: parts.monthLower, year: parts.year })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <button
          onClick={toggleTheme}
          aria-label={isDark ? t('toLight') : t('toDark')}
          title={isDark ? t('light') : t('dark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-body transition-colors duration-150 hover:bg-canvas hover:text-ink">
          
          {isDark ? <SunIcon className="h-[18px] w-[18px]" aria-hidden /> : <MoonIcon className="h-[18px] w-[18px]" aria-hidden />}
        </button>
        <div className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden />
        <button className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-canvas">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-ink ring-1 ring-line">R</span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-bold text-ink">Rabola Admin</span>
            <span className="block text-xs text-muted">{t('adminRole')}</span>
          </span>
          <ChevronDownIcon className="h-4 w-4 text-muted" aria-hidden />
        </button>
      </div>
    </header>);

}
