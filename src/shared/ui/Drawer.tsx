'use client';
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
  width?: string;
}

const ease = [0.23, 1, 0.32, 1] as const;

export function Drawer({ open, title, subtitle, onClose, footer, children, width = 'max-w-xl' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
          className="absolute inset-0 bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ duration: 0.25, ease }}
          className={`relative flex h-full w-full ${width} flex-col border-l border-line bg-surface shadow-2xl`}>
          
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
              <div className="min-w-0">
                <h2 id="drawer-title" className="text-base font-semibold tracking-tight text-ink">
                  {title}
                </h2>
                {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
              </div>
              <button
              onClick={onClose}
              aria-label="Yopish"
              className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
              
                <XIcon className="h-5 w-5" aria-hidden />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            <footer className="flex items-center justify-end gap-2 border-t border-line px-6 py-3.5">{footer}</footer>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
