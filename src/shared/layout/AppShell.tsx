'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Toaster } from 'sonner';
import { Sidebar } from '@/shared/layout/Sidebar';
import { TopBar } from '@/shared/layout/TopBar';
import { useTheme } from '@/shared/hooks/useTheme';
import { PayrollProvider } from '@/shared/context/PayrollContext';

/** Route -> nav translation key. */
const titleKeys: Record<string, string> = {
  '/': 'employees',
  '/monitoring': 'monitoring',
  '/xodimlar/yangi': 'employees',
  '/ish-haqi': 'payroll',
  '/qurilmalar': 'devices',
  '/filiallar': 'branches',
  '/adminlar': 'admins'
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname() ?? '/';
  const key = titleKeys[pathname] ?? (pathname.startsWith('/xodimlar') ? 'employees' : undefined);
  const title = key ? tNav(key) : tCommon('appName');
  return (
    <div className="flex min-h-screen w-full bg-canvas font-sans text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} />
        <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 md:p-6">
          <PayrollProvider>{children}</PayrollProvider>
        </main>
      </div>
      <Toaster theme={theme} position="bottom-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif' } }} />
    </div>);

}
