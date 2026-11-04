'use client';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { BuildingIcon, XIcon } from 'lucide-react';
import { useGloss } from '@/shared/i18n/format';
import type { Employee } from '@/shared/types/employee';

const ease = [0.23, 1, 0.32, 1] as const;

interface BranchListDialogProps {
  employee: Employee | null;
  onClose: () => void;
}

export function BranchListDialog({ employee, onClose }: BranchListDialogProps) {
  const t = useTranslations('employees.branchDialog');
  const tc = useTranslations('common');
  const { g } = useGloss();
  useEffect(() => {
    if (!employee) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [employee, onClose]);

  const list = employee ? [employee.branch, ...(employee.otherBranches ?? [])] : [];

  return (
    <AnimatePresence>
      {employee &&
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}>
        
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-list-title"
          className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 id="branch-list-title" className="truncate text-base font-semibold tracking-tight text-ink">
                  {employee.name}
                </h2>
                <p className="mt-0.5 text-[13px] text-muted">{t('worksIn', { count: list.length })}</p>
              </div>
              <button
              onClick={onClose}
              aria-label={tc('close')}
              className="shrink-0 rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
              
                <XIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <ul className="mt-4 space-y-1.5">
              {list.map((b, i) =>
              <li
                key={b}
                className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink">
                
                  <BuildingIcon className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
                  <span className="min-w-0 truncate">{g(b)}</span>
                  {i === 0 &&
                <span className="ml-auto shrink-0 rounded bg-brand-soft px-1.5 text-[11px] font-semibold text-muted">{t('main')}</span>
                }
                </li>
            )}
            </ul>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}
