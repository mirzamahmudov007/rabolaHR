'use client';
import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addMonths, setYear, startOfMonth } from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Calendar } from '@/shared/ui/Calendar';
import { useDismiss } from '@/shared/hooks/useDismiss';
import { useDateFmt } from '@/shared/i18n/format';
import { TODAY, formatDate } from '@/shared/utils/date';

interface DatePickerProps {
  value: Date | null;
  onChange: (d: Date) => void;
  maxDate?: Date;
  placeholder?: string;
  block?: boolean;
  id?: string;
  /** Initial month shown when there is no value yet. */
  defaultMonth?: Date;
}

export function DatePicker({
  value,
  onChange,
  maxDate = TODAY,
  placeholder,
  block,
  id,
  defaultMonth
}: DatePickerProps) {
  const t = useTranslations('ui');
  const tc = useTranslations('common');
  useDateFmt();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'days' | 'years'>('days');
  const [month, setMonth] = useState(startOfMonth(value ?? defaultMonth ?? TODAY));
  const [decade, setDecade] = useState(Math.floor((value ?? TODAY).getFullYear() / 12) * 12);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const pick = (d: Date) => {
    onChange(d);
    setOpen(false);
  };

  const years = Array.from({ length: 12 }, (_, i) => decade + i);
  const navBtn =
  'flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink';

  return (
    <div ref={ref} className={`relative ${block ? 'w-full' : ''}`}>
      <button
        id={id}
        type="button"
        onClick={() => {
          const base = value ?? defaultMonth ?? TODAY;
          setMonth(startOfMonth(base));
          setDecade(Math.floor(base.getFullYear() / 12) * 12);
          setView('days');
          setOpen((o) => !o);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg border bg-field px-3 text-sm tabular-nums transition-colors duration-150 ${
        block ? 'h-10 w-full' : 'h-9'} ${
        open ? 'border-ink/40' : 'border-line hover:border-ink/20'} ${value ? 'text-ink' : 'text-subtle'}`}>
        
        <CalendarIcon className="h-4 w-4 text-muted" aria-hidden />
        {value ? formatDate(value) : placeholder ?? t('datePlaceholder')}
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          role="dialog"
          aria-label={t('dateDialogAria')}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 top-full z-40 mt-1.5 origin-top-left rounded-xl border border-line bg-surface p-3 shadow-xl">
          
            {view === 'days' ?
          <Calendar
            month={month}
            selected={value}
            maxDate={maxDate}
            onSelect={pick}
            onPrev={() => setMonth((m) => addMonths(m, -1))}
            onNext={() => setMonth((m) => addMonths(m, 1))}
            onTitleClick={() => setView('years')} /> :


          <div className="w-[252px]">
                <div className="mb-2 flex h-7 items-center justify-between">
                  <button onClick={() => setDecade((d) => d - 12)} className={navBtn} aria-label={t('prevYears')}>
                    <ChevronLeftIcon className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="text-sm font-semibold tabular-nums text-ink">
                    {years[0]} – {years[years.length - 1]}
                  </span>
                  <button onClick={() => setDecade((d) => d + 12)} className={navBtn} aria-label={t('nextYears')}>
                    <ChevronRightIcon className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {years.map((y) => {
                const disabled = y > maxDate.getFullYear();
                const active = y === month.getFullYear();
                return (
                  <button
                    key={y}
                    disabled={disabled}
                    onClick={() => {
                      setMonth((m) => setYear(m, y));
                      setView('days');
                    }}
                    className={`h-10 rounded-md text-sm tabular-nums transition-colors duration-100 ${
                    active ?
                    'bg-brand font-semibold text-on-brand' :
                    disabled ?
                    'cursor-not-allowed text-subtle/50' :
                    'text-body hover:bg-canvas'}`
                    }>
                    
                        {y}
                      </button>);

              })}
                </div>
              </div>
          }
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2.5">
              <span className="text-xs text-muted">{value ? t('selectedDate', { date: formatDate(value) }) : t('noDate')}</span>
              {TODAY <= maxDate &&
            <button
              onClick={() => pick(TODAY)}
              className="rounded-md px-2 py-1 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-canvas">
              
                  {tc('today')}
                </button>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
