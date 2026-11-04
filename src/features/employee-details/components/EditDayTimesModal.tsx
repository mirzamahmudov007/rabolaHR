'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ClockIcon, RotateCcwIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { TextInput } from '@/shared/form/TextInput';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { t as ts } from '@/shared/i18n/static';
import { formatMoney } from '@/shared/utils/employeeForm';
import { dayLabel, dayState, previewDay, workedLabel } from '@/features/employee-details/utils/attendance';
import type { Employee } from '@/shared/types/employee';
import type { DayRecord, TimeOverride } from '@/features/employee-details/utils/attendance';

const ease = [0.23, 1, 0.32, 1] as const;

/** "14 daq kech" / "11 daq erta" — what a clock entry means against the schedule. */
function deviation(minutes: number, kind: 'in' | 'out'): {text: string;tone: 'pos' | 'neg' | 'none';} {
  const abs = Math.abs(minutes);
  if (minutes > 0) return { text: ts(kind === 'in' ? 'common.minutesLate' : 'common.minutesOvertime', { min: abs }), tone: kind === 'in' ? 'neg' : 'pos' };
  if (minutes < 0) return { text: ts(kind === 'in' ? 'common.minutesEarlyIn' : 'common.minutesEarlyOut', { min: abs }), tone: kind === 'in' ? 'pos' : 'neg' };
  return { text: ts('details.edit.onPlan'), tone: 'none' };
}

const toMin = (t: string) => {const [h, m] = t.split(':').map(Number);return h * 60 + m;};
const minutesOf = (actual?: string, required?: string) =>
actual && required ? toMin(actual) - toMin(required) : null;

const toneClass = { pos: 'text-present-ink', neg: 'text-absent-ink', none: 'text-subtle' } as const;

interface EditSheetProps {
  employee: Employee;
  month: Date;
  record: DayRecord;
  onClose: () => void;
  onSave: (day: Date, times: TimeOverride) => void;
  onReset: (day: Date) => void;
}

function EditSheet({ employee, month, record, onClose, onSave, onReset }: EditSheetProps) {
  const t = useTranslations('details.edit');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  useEffect(() => {
    setCheckIn(record.checkIn ?? record.reqIn ?? '');
    setCheckOut(record.checkOut ?? record.reqOut ?? '');
  }, [record]);

  const times: TimeOverride = { checkIn: checkIn || undefined, checkOut: checkOut || undefined };
  const preview = previewDay(employee, month, record.day, times);

  const payBefore = record.pay ?? 0;
  const payAfter = preview.pay ?? 0;
  const payDelta = payAfter - payBefore;
  const meta = dayState[preview.status];
  const changed = checkIn !== (record.checkIn ?? '') || checkOut !== (record.checkOut ?? '');

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-times-title"
      className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-line bg-canvas shadow-2xl sm:rounded-2xl"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.2, ease }}>

      <header className="flex items-start justify-between gap-4 border-b border-line bg-surface px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="edit-times-title" className="text-base font-semibold tracking-tight text-ink">
              {dayLabel(record.day)}
            </h2>
            {meta &&
            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>{meta.text}</span>
            }
          </div>
          <p className="mt-1 text-[12px] text-muted">
            {t('title')} — {record.reqIn ? t('plan', { times: ts('common.range', { from: record.reqIn, to: record.reqOut ?? '' }) }) : t('notWorkday')}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={ts('common.close')}
          className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">

          <XIcon className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-body">{t('checkIn')}</span>
            <TextInput
              type="time"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              leading={<ClockIcon className="h-4 w-4" aria-hidden />}
              className="w-full sm:w-40" />
            {minutesOf(checkIn, record.reqIn) !== null &&
            <span className={`mt-1 block text-[11px] font-medium ${toneClass[deviation(minutesOf(checkIn, record.reqIn)!, 'in').tone]}`}>
                {deviation(minutesOf(checkIn, record.reqIn)!, 'in').text}
              </span>
            }
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-body">{t('checkOut')}</span>
            <TextInput
              type="time"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              leading={<ClockIcon className="h-4 w-4" aria-hidden />}
              className="w-full sm:w-40" />
            {minutesOf(checkOut, record.reqOut) !== null &&
            <span className={`mt-1 block text-[11px] font-medium ${toneClass[deviation(minutesOf(checkOut, record.reqOut)!, 'out').tone]}`}>
                {deviation(minutesOf(checkOut, record.reqOut)!, 'out').text}
              </span>
            }
          </label>
        </div>

        <section className="rounded-lg border border-line bg-surface p-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{t('after')}</h3>
          <dl className="mt-1.5 space-y-1">
            {[
            { label: t('worked'), before: workedLabel(record), after: workedLabel(preview) },
            { label: ts('data.rule.kind.bonus'), before: formatMoney(record.bonus ?? 0), after: formatMoney(preview.bonus ?? 0) },
            { label: ts('data.rule.kind.penalty'), before: formatMoney(record.fine ?? 0), after: formatMoney(preview.fine ?? 0) },
            { label: ts('details.table.col.pay'), before: formatMoney(payBefore), after: formatMoney(payAfter) }].
            map((row) =>
            <div key={row.label} className="flex items-baseline justify-between gap-3 text-[12px]">
                <dt className="text-muted">{row.label}</dt>
                <dd className="flex items-baseline gap-2 tabular-nums">
                  <span className="text-subtle line-through">{row.before}</span>
                  <span className="font-semibold text-ink">{row.after}</span>
                </dd>
              </div>
            )}
          </dl>
          {payDelta !== 0 &&
          <p className={`mt-2 text-[11px] font-semibold ${payDelta > 0 ? 'text-present-ink' : 'text-absent-ink'}`}>
              {t(payDelta > 0 ? 'payUp' : 'payDown', { amount: formatMoney(Math.abs(payDelta)) })}
            </p>
          }
          <p className="mt-2 text-[11px] leading-snug text-muted">{preview.calc.note}</p>
        </section>
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-5 py-3.5">
        {record.manual &&
        <Button variant="neutral" size="sm" className="mr-auto font-semibold" icon={<RotateCcwIcon className="h-4 w-4" aria-hidden />} onClick={() => onReset(record.day)}>
          {t('resetCamera')}
        </Button>
        }
        <Button variant="neutral" size="sm" onClick={onClose}>{ts('common.cancel')}</Button>
        <Button size="sm" disabled={!changed || (!checkIn && !checkOut)} onClick={() => onSave(record.day, times)}>
          {ts('common.save')}
        </Button>
      </footer>
    </motion.div>);

}

interface EditDayTimesModalProps extends Omit<EditSheetProps, 'record'> {
  /** The day being corrected; null keeps the dialog closed. */
  record: DayRecord | null;
}

/** Manual correction of a day's clock-in / clock-out times. */
export function EditDayTimesModal({ employee, month, record, onClose, onSave, onReset }: EditDayTimesModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = record !== null;
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {record &&
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}>

          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
          <EditSheet
            employee={employee}
            month={month}
            record={record}
            onClose={onClose}
            onSave={onSave}
            onReset={onReset} />
        </motion.div>
      }
    </AnimatePresence>,
    document.body);
}
