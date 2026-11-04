'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { eachMonthOfInterval, endOfDay, format, startOfDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ArchiveIcon, PencilIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import { ReportDownload } from '@/shared/components/ReportDownload';
import { t as ts } from '@/shared/i18n/static';
import { useGloss } from '@/shared/i18n/format';
import { formatDate } from '@/shared/utils/date';
import { buildMonth } from '@/features/employee-details/utils/attendance';
import type { Employee } from '@/shared/types/employee';
import type { DayRecord, DayStatus, TimeOverride } from '@/features/employee-details/utils/attendance';

const statusLabel = (s: DayStatus) => ts(`data.dayState.${s}`);

/** Minutes that pay (early arrival from 10 min, overtime from 15 min) — same rule as the table. */
const bonusMinutes = (r: DayRecord) =>
[r.earlyIn && r.earlyIn >= 10 ? ts('common.minutesEarlyIn', { min: r.earlyIn }) : null,
r.overtime && r.overtime >= 15 ? ts('common.minutesOvertime', { min: r.overtime }) : null].
filter(Boolean) as string[];

const fineMinutes = (r: DayRecord) =>
[r.lateIn ? ts('common.minutesLate', { min: r.lateIn }) : null,
r.earlyOut ? ts('common.minutesEarlyOut', { min: r.earlyOut }) : null].
filter(Boolean) as string[];

/** The chosen days, taken from the months the range touches — manual corrections included. */
function recordsInRange(employee: Employee, from: Date, to: Date, overrides?: Record<string, TimeOverride>): DayRecord[] {
  const lo = startOfDay(from).getTime();
  const hi = endOfDay(to).getTime();
  return eachMonthOfInterval({ start: from, end: to }).
  flatMap((m) => buildMonth(employee, m, overrides)).
  filter((r) => r.day.getTime() >= lo && r.day.getTime() <= hi);
}

/** Same columns as the Davomat table — a spreadsheet the accountant can open straight away. */
function buildCsv(records: DayRecord[]): string {
  const head = [
    ts('details.actions.csv.day'), ts('details.actions.csv.status'), ts('details.actions.csv.shift'),
    ts('details.actions.csv.in'), ts('details.actions.csv.out'), ts('details.actions.csv.bonusTime'),
    ts('details.actions.csv.fineTime'), ts('details.actions.csv.worked'), ts('details.actions.csv.bonus'),
    ts('details.actions.csv.fine'), ts('details.actions.csv.pay'), ts('details.actions.csv.source')];

  const rows = records.map((r) =>
  [
    formatDate(r.day),
    statusLabel(r.status),
    r.reqIn ? `${r.reqIn}-${r.reqOut}` : '',
    r.checkIn ?? '',
    r.checkOut ?? '',
    bonusMinutes(r).join(' + '),
    fineMinutes(r).join(' + '),
    r.hours ?? '',
    r.bonus ?? '',
    r.fine ?? '',
    r.status === 'off' || r.status === 'future' ? '' : r.pay ?? '',
    r.manual ? ts('details.actions.csv.manual') : ts('details.actions.csv.camera')]);


  return [head, ...rows].map((cols) => cols.join(';')).join('\r\n');
}

/** Profile actions: edit, archive (with confirmation) and download a report for a chosen range. */
export function EmployeeActions({ employee, overrides }: {employee: Employee;overrides?: Record<string, TimeOverride>;}) {
  const t = useTranslations('details.actions');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!confirmArchive) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setConfirmArchive(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmArchive]);

  const exportCsv = (from: Date, to: Date) => {
    const csv = `\uFEFF${buildCsv(recordsInRange(employee, from, to, overrides))}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `davomat-${employee.code}-${format(from, 'dd.MM.yyyy')}-${format(to, 'dd.MM.yyyy')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          icon={<PencilIcon className="h-4 w-4" aria-hidden />}
          className="whitespace-nowrap shadow-[0_1px_2px_rgba(15,23,42,0.25)]"
          onClick={() => router.push('/xodimlar/yangi')}>
          {tc('edit')}
        </Button>
        <Button
          variant="secondary"
          icon={<ArchiveIcon className="h-4 w-4" aria-hidden />}
          className="whitespace-nowrap border-absent/30 text-absent-ink hover:bg-absent-soft hover:text-absent-ink"
          onClick={() => setConfirmArchive(true)}>
          {t('archive')}
        </Button>
        <ReportDownload
          scopeLabel={`${g(employee.name)} · ${employee.code}`}
          label={t('report')}
          formats={['xlsx']}
          onDownload={exportCsv} />
      </div>

      {mounted &&
      createPortal(
        <AnimatePresence>
          {confirmArchive &&
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
              <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setConfirmArchive(false)} />

              <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="archive-title"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-xl">
              
                <h2 id="archive-title" className="text-base font-semibold text-ink">
                  {t('archiveTitle', { name: g(employee.name) })}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {t('archiveDesc')}
                </p>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="neutral" onClick={() => setConfirmArchive(false)}>
                    {tc('cancel')}
                  </Button>
                  <Button
                    autoFocus
                    onClick={() => {
                      setConfirmArchive(false);
                      toast.success(t('archived'), {
                        description: `${g(employee.name)} · ${employee.code}`
                      });
                    }}>
                    {t('archive')}
                  </Button>
                </div>
              </motion.div>
            </div>
          }
        </AnimatePresence>,
        document.body)
      }
    </>);

}
