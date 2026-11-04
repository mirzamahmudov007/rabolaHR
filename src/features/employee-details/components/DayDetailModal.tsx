'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useScrollLock } from '@/shared/hooks/useScrollLock';
import { t as ts } from '@/shared/i18n/static';
import { useGloss } from '@/shared/i18n/format';
import { formatMoney } from '@/shared/utils/employeeForm';
import { dayLabel, dayState, fmtDuration, workedLabel } from '@/features/employee-details/utils/attendance';
import type { CalcStep, DayRecord } from '@/features/employee-details/utils/attendance';

const ease = [0.23, 1, 0.32, 1] as const;

const workTypeTone: Record<string, string> = {
  Oddiy: 'bg-type-regular-soft text-type-regular-ink',
  Smenali: 'bg-type-shift-soft text-type-shift-ink',
  Sikl: 'bg-type-cycle-soft text-type-cycle-ink'
};

function Line({ label, value, tone }: {label: string;value: React.ReactNode;tone?: 'pos' | 'neg';}) {
  const c = tone === 'pos' ? 'text-present-ink' : tone === 'neg' ? 'text-absent-ink' : 'text-ink';
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[12px] text-muted">{label}</span>
      <span className={`text-[12px] font-semibold tabular-nums ${c}`}>{value}</span>
    </div>);
}

function Block({ title, hint, children }: {title: string;hint?: string;children: React.ReactNode;}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{title}</h3>
      {hint && <p className="mt-0.5 text-[11px] leading-snug text-subtle">{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </section>);
}

function Total({ label, amount, tone }: {label: string;amount: number;tone: 'pos' | 'neg';}) {
  const c = tone === 'pos' ? 'text-present-ink' : 'text-absent-ink';
  return (
    <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</span>
      <span className={`text-[13px] font-bold tabular-nums ${c}`}>{formatMoney(amount)}</span>
    </div>);
}

/** Itemised bonus / fine lines: what was counted, the arithmetic, the result. */
function Steps({ steps, empty, tone }: {steps: CalcStep[];empty: string;tone: 'pos' | 'neg';}) {
  if (!steps.length) return <p className="text-[12px] leading-relaxed text-muted">{empty}</p>;
  const cls = tone === 'pos' ? 'text-present-ink' : 'text-absent-ink';
  return (
    <ul className="space-y-2">
      {steps.map((s) =>
      <li key={s.label} className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] font-medium text-body">{s.label}</div>
            <div className="text-[11px] tabular-nums text-subtle">{s.formula}</div>
          </div>
          <span className={`shrink-0 text-[12px] font-semibold tabular-nums ${cls}`}>{formatMoney(s.amount)}</span>
        </li>
      )}
    </ul>);
}

function DaySheet({ record, onClose }: {record: DayRecord;onClose: () => void;}) {
  const t = useTranslations('details.day');
  const { g } = useGloss();
  const { calc } = record;
  const status = record.status;
  const state = dayState[status];
  const arrived = status === 'present' || status === 'late';
  const base = record.base ?? 0;
  const bonus = record.bonus ?? 0;
  const fine = record.fine ?? 0;
  const pay = record.pay ?? 0;
  const rate = Math.round(calc.perMinute);
  const min = (n: number) => `${n} ${ts('common.units.min')}`;

  const bonusEmpty =
  status === 'off' || status === 'future' ? t('bonusNotWorkday') :
  status === 'absent' ? t('bonusAbsent') :
  status === 'leave' ? t('bonusLeave') :
  t('bonusNone');

  const fineEmpty =
  status === 'off' || status === 'future' ? t('fineNotWorkday') :
  status === 'absent' ? t('fineAbsent') :
  status === 'leave' ? t('fineLeave') :
  t('fineNone');

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-title"
      className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-canvas shadow-2xl sm:rounded-2xl"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.2, ease }}>

      <header className="flex items-start justify-between gap-4 border-b border-line bg-surface px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="day-detail-title" className="text-base font-semibold tracking-tight text-ink">
              {dayLabel(record.day)}
            </h2>
            {status !== 'future' && <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold ${state.cls}`}>{state.text}</span>}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${workTypeTone[calc.workType]}`}>{g(calc.workType)}</span>
            {record.shiftLabel && <span>{record.shiftLabel}</span>}
            <span className="text-subtle">·</span>
            <span>{calc.offRule}</span>
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label={ts('common.close')}
          className="rounded-lg p-1.5 text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">

          <XIcon className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Block title={t('schedule')} hint={t('scheduleHint', { type: g(calc.workType) })}>
            <Line label={t('plan')} value={record.reqIn ? ts('common.range', { from: record.reqIn, to: record.reqOut ?? '' }) : '—'} />
            <Line label={t('planDuration')} value={fmtDuration(calc.targetMin)} />
            <Line label={t('break')} value={calc.breakMin ? t('breakUnpaid', { min: calc.breakMin }) : ts('common.none')} />
            <Line label={t('offRule')} value={calc.offRule} />
          </Block>

          <Block title={t('fact')} hint={record.manual ? t('factManual') : t('factCamera')}>
            <Line label={t('arrival')} value={record.checkIn ?? (status === 'absent' ? ts('data.dayStateShort.absent') : '—')} />
            <Line label={t('departure')} value={record.checkOut ?? (record.checkIn ? ts('common.notSet') : '—')} />
            <Line label={t('worked')} value={arrived ? workedLabel(record) : '—'} />
            <Line label={t('lateIn')} value={arrived ? min(record.lateIn ?? 0) : '—'} tone={record.lateIn ? 'neg' : undefined} />
            <Line label={t('earlyIn')} value={arrived ? min(record.earlyIn ?? 0) : '—'} tone={record.earlyIn && record.earlyIn >= 10 ? 'pos' : undefined} />
            <Line label={t('overtime')} value={arrived ? min(record.overtime ?? 0) : '—'} tone={record.overtime && record.overtime >= 15 ? 'pos' : undefined} />
            <Line label={t('earlyOut')} value={arrived ? min(record.earlyOut ?? 0) : '—'} tone={record.earlyOut ? 'neg' : undefined} />
          </Block>
        </div>

        <Block title={t('baseTitle')} hint={t('baseHint')}>
          <Line label={t('monthlyBase')} value={ts('common.money', { amount: formatMoney(calc.monthlyBase) })} />
          <Line label={t('expectedDays')} value={ts('dates.days', { count: calc.expectedWorkdays })} />
          <Line label={t('dailyBase')} value={t('dailyBaseFormula', { monthly: formatMoney(calc.monthlyBase), days: calc.expectedWorkdays, daily: formatMoney(calc.dailyBase) })} />
          <Line label={t('minuteRate')} value={t('minuteRateFormula', { daily: formatMoney(calc.dailyBase), minutes: calc.targetMin, unit: ts('common.units.min'), rate: ts('common.moneyPerMinute', { amount: formatMoney(rate) }) })} />
          <Line label={t('baseForDay')} value={ts('common.money', { amount: formatMoney(base) })} tone={status === 'absent' ? 'neg' : undefined} />
        </Block>

        <div className="grid gap-3 sm:grid-cols-2">
          <Block title={t('bonusTitle')}>
            <Steps steps={calc.bonusSteps} empty={bonusEmpty} tone="pos" />
            <Total label={t('bonusTotal')} amount={bonus} tone="pos" />
          </Block>

          <Block title={t('fineTitle')}>
            <Steps steps={calc.fineSteps} empty={fineEmpty} tone="neg" />
            {status === 'absent' && <Line label={t('unpaidBase')} value={`− ${formatMoney(calc.dailyBase)}`} tone="neg" />}
            <Total label={t('fineTotal')} amount={fine} tone="neg" />
          </Block>
        </div>

        <p className="text-[12px] leading-relaxed text-muted">
          <span className="font-semibold text-body">{t('noteLabel')} </span>{calc.note || t('noteClean')}
        </p>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
          <span>{t('footerBase', { amount: formatMoney(base) })}</span>
          {bonus > 0 && <span className="text-present-ink">{t('footerBonus', { amount: formatMoney(bonus) })}</span>}
          {fine > 0 && <span className="text-absent-ink">{t('footerFine', { amount: formatMoney(fine) })}</span>}
        </div>
        <div className="text-sm font-bold tabular-nums text-ink">{ts('common.money', { amount: formatMoney(pay) })}</div>
      </footer>
    </motion.div>);
}

export function DayDetailModal({ record, onClose }: {record: DayRecord | null;onClose: () => void;}) {
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
          <DaySheet record={record} onClose={onClose} />
        </motion.div>
      }
    </AnimatePresence>,
    document.body);
}
