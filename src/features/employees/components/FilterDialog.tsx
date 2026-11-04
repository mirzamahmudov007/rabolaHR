'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronRightIcon, SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { TextInput } from '@/shared/form/TextInput';
import { useGloss } from '@/shared/i18n/format';
import { emptyFilters } from '@/shared/types/employee';
import { filterCategories } from '@/features/employees/utils/employeeFilters';
import type { EmployeeFilters, FilterKey } from '@/shared/types/employee';
import type { FilterOption } from '@/features/employees/utils/employeeFilters';

interface FilterDialogProps {
  open: boolean;
  value: EmployeeFilters;
  options: Record<FilterKey, FilterOption[]>;
  onClose: () => void;
  onApply: (filters: EmployeeFilters) => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

export function FilterDialog({ open, value, options, onClose, onApply }: FilterDialogProps) {
  const t = useTranslations('employees.dialog');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [draft, setDraft] = useState<EmployeeFilters>(value);
  const [category, setCategory] = useState<FilterKey>('position');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(value);
      setSearch('');
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggle = (val: string) =>
  setDraft((d) => ({
    ...d,
    [category]: d[category].includes(val) ? d[category].filter((v) => v !== val) : [...d[category], val]
  }));

  const visible = options[category].filter((o) => g(o.value).toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <AnimatePresence>
      {open &&
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
          aria-labelledby="filter-title"
          className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-line bg-surface shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="filter-title" className="text-lg font-semibold tracking-tight text-ink">
                {t('title')}
              </h2>
              <button
              onClick={onClose}
              aria-label={tc('close')}
              className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
              
                <XIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[220px_1fr]">
              <nav className="border-b border-line p-3 sm:border-b-0 sm:border-r" aria-label={t('categories')}>
                {filterCategories.map((c) => {
                const isActive = c.key === category;
                const count = draft[c.key].length;
                return (
                  <button
                    key={c.key}
                    onClick={() => {
                      setCategory(c.key);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-semibold transition-colors duration-150 ${
                    isActive ? 'bg-canvas text-ink' : 'text-body hover:bg-canvas'}`
                    }>
                    
                      <span>{t(c.labelKey)}</span>
                      <span className="flex items-center gap-2">
                        {count > 0 &&
                      <span className="rounded-md bg-brand px-1.5 text-xs font-semibold text-on-brand">{count}</span>
                      }
                        <ChevronRightIcon className="h-4 w-4 text-subtle" aria-hidden />
                      </span>
                    </button>);

              })}
              </nav>

              <div className="flex min-h-0 flex-col p-4">
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('search')}
                  aria-label={t('search')}
                  leading={<SearchIcon className="h-4 w-4" aria-hidden />} />
                
                <ul className="mt-2 max-h-[320px] min-h-[200px] overflow-y-auto">
                  {visible.map((o) => {
                  const checked = draft[category].includes(o.value);
                  return (
                    <li key={o.value}>
                        <button
                        onClick={() => toggle(o.value)}
                        role="checkbox"
                        aria-checked={checked}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] text-body transition-colors duration-150 hover:bg-canvas">
                        
                          <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
                          checked ? 'border-brand bg-brand text-on-brand' : 'border-line bg-field'}`
                          }>
                          
                            {checked && <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                          </span>
                          {g(o.value)}
                        </button>
                      </li>);

                })}
                  {visible.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted">{t('emptyOptions')}</li>}
                </ul>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <button
              onClick={() => setDraft(emptyFilters)}
              className="self-start text-[15px] font-bold text-absent-ink transition-opacity duration-150 hover:opacity-80">
              
                {t('clear')}
              </button>
              <div className="flex gap-2">
                <Button variant="secondary" size="lg" className="font-bold" onClick={onClose}>
                  {tc('close')}
                </Button>
                <Button variant="brand" size="lg" className="font-semibold" onClick={() => onApply(draft)}>
                  {t('apply')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}