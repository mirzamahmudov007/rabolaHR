'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, FileSpreadsheetIcon, UserPlusIcon } from 'lucide-react';

/** `key` picks the message pair and the action; the single-employee entry navigates. */
const menuItems = [
{ key: 'single', icon: UserPlusIcon },
{ key: 'excel', icon: FileSpreadsheetIcon }] as const;


export function AddEmployeeButton() {
  const t = useTranslations('employees.add');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <div className="inline-flex h-9 overflow-hidden rounded-lg bg-ink text-surface shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_1px_2px_rgba(15,23,42,0.2)]">
        <button
          onClick={() => router.push('/xodimlar/yangi')}
          className="inline-flex items-center gap-2 pl-3.5 pr-3 text-sm font-medium transition-opacity duration-150 hover:opacity-90 active:opacity-80">
          
          <UserPlusIcon className="h-4 w-4" aria-hidden />
          {t('button')}
        </button>
        <span className="my-2 w-px bg-surface/20" aria-hidden />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={t('otherWays')}
          aria-haspopup="menu"
          aria-expanded={open}
          className="inline-flex w-8 items-center justify-center transition-opacity duration-150 hover:opacity-90">
          
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
            aria-hidden />
          
        </button>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-1.5 w-64 origin-top-right rounded-xl border border-line bg-surface p-1.5 shadow-xl">
          
            {menuItems.map(({ key, icon: Icon }) =>
          <button
            key={key}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              if (key === 'single') router.push('/xodimlar/yangi');
            }}
            className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 hover:bg-canvas">
                        
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span>
                  <span className="block text-sm font-semibold text-ink">{t(key)}</span>
                  <span className="block text-xs text-muted">{t(`${key}Hint`)}</span>
                </span>
              </button>
          )}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}