'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BuildingIcon,
  CctvIcon,
  LogOutIcon,
  ScanEyeIcon,
  ScanFaceIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';

type NavItem = {labelKey: string;icon: typeof UsersIcon;to: string;};

/** Only pages that actually work — dead entries stay out until their page ships. */
const items: NavItem[] = [
{ labelKey: 'monitoring', icon: ScanEyeIcon, to: '/monitoring' },
{ labelKey: 'employees', icon: UsersIcon, to: '/' },
{ labelKey: 'payroll', icon: WalletIcon, to: '/ish-haqi' },
{ labelKey: 'branches', icon: BuildingIcon, to: '/filiallar' },
{ labelKey: 'devices', icon: CctvIcon, to: '/qurilmalar' },
{ labelKey: 'admins', icon: ShieldCheckIcon, to: '/adminlar' },
{ labelKey: 'settings', icon: SettingsIcon, to: '/sozlamalar' }];


const base = 'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-150';
const idle = 'text-muted hover:bg-canvas hover:text-ink';
const activeCls = 'bg-brand-soft text-ink';

export function Sidebar() {
  const pathname = usePathname() ?? '/';
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const isActive = (to: string) =>
  to === '/' ?
  pathname === '/' || pathname.startsWith('/xodimlar') :
  pathname === to;

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-line px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-on-brand shadow-sm">
          <ScanFaceIcon className="h-5 w-5" aria-hidden />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-ink">{tc('appName')}</div>
          <div className="text-xs text-muted">{tc('appTagline')}</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t('mainMenu')}>
        <ul className="space-y-1">
          {items.map(({ labelKey, icon: Icon, to }) => {
            const active = isActive(to);
            return (
              <li key={labelKey}>
                <Link
                  href={to}
                  aria-current={active ? 'page' : undefined}
                  className={`${base} ${active ? activeCls : idle}`}>
                  
                  {active &&
                  <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-brand" aria-hidden />
                  }
                  <Icon className={`h-[18px] w-[18px] ${active ? 'text-brand' : ''}`} aria-hidden />
                  {t(labelKey)}
                </Link>
              </li>);

          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
          <LogOutIcon className="h-[18px] w-[18px]" aria-hidden />
          {t('logout')}
        </button>
      </div>
    </aside>);

}
