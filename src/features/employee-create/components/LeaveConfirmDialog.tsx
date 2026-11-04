'use client';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';

interface LeaveConfirmDialogProps {
  open: boolean;
  onStay: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
}

export function LeaveConfirmDialog({ open, onStay, onSaveDraft, onDiscard }: LeaveConfirmDialogProps) {
  const t = useTranslations('create.leave');
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onStay();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onStay]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onStay} />
        
          <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="leave-title"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl">
          
            <h2 id="leave-title" className="text-base font-semibold text-ink">
              {t('title')}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {t('desc')}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="danger" onClick={onDiscard} className="sm:mr-auto">
                {t('discard')}
              </Button>
              <Button variant="secondary" onClick={onSaveDraft}>
                {t('saveExit')}
              </Button>
              <Button autoFocus onClick={onStay} className="px-4">
                {t('stay')}
              </Button>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}