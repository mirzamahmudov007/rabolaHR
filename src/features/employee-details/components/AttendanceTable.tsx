'use client';
import React, { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ClockIcon, InfoIcon, PencilIcon } from 'lucide-react';
import { formatDayNum } from '@/shared/utils/date';
import { t as ts, weekdayShort } from '@/shared/i18n/static';
import { useGloss } from '@/shared/i18n/format';
import { formatMoney } from '@/shared/utils/employeeForm';
import { IconButton } from '@/shared/ui/IconButton';
import { dayState, fmtDuration, monthLabel, workedLabel } from '@/features/employee-details/utils/attendance';
import { DayDetailModal } from '@/features/employee-details/components/DayDetailModal';
import { EditDayTimesModal } from '@/features/employee-details/components/EditDayTimesModal';
import type { Employee, WorkType } from '@/shared/types/employee';
import type { DayRecord, DayStatus, MonthStats, TimeOverride } from '@/features/employee-details/utils/attendance';

const th = 'border-b border-line bg-surface-2 px-2.5 py-3 text-[12px] font-semibold text-muted';
const td = 'border-b border-line px-2.5 py-2.5 align-middle text-[13px] tabular-nums';

/** A 4px accent bar on the row's left edge carries the state — no need to flood the whole row with colour. */
const accent: Record<DayStatus, string> = {
  present: 'border-l-present bg-present-soft/35',
  late: 'border-l-late bg-late-soft/40',
  absent: 'border-l-absent bg-absent-soft/35',
  leave: 'border-l-leave bg-leave-soft/35',
  off: 'border-l-type-regular bg-type-regular-soft/40',
  future: 'border-l-line'
};

const rowTint: Record<DayStatus, string> = {
  present: 'hover:bg-present-soft/60',
  late: 'hover:bg-late-soft/70',
  absent: 'hover:bg-absent-soft/60',
  leave: 'hover:bg-leave-soft/60',
  off: 'hover:bg-type-regular-soft/70',
  future: 'hover:bg-surface-2'
};

const legend: {key: string;bar: string;}[] =
[{ key: 'legendOnTime', bar: 'bg-present' },
{ key: 'legendLate', bar: 'bg-late' },
{ key: 'legendAbsent', bar: 'bg-absent' },
{ key: 'legendOff', bar: 'bg-type-regular' },
{ key: 'legendLeave', bar: 'bg-leave' }];


const workTypeTone: Record<WorkType, string> = {
  Oddiy: 'bg-type-regular-soft text-type-regular-ink',
  Smenali: 'bg-type-shift-soft text-type-shift-ink',
  Sikl: 'bg-type-cycle-soft text-type-cycle-ink'
};

const headAlign = { start: 'text-left', center: 'text-center', end: 'text-right' } as const;
const tipAlign = { start: 'left-0', center: 'left-1/2 -translate-x-1/2', end: 'right-0' } as const;

/**
 * Column title with an explanation on hover/focus.
 * The tip opens downwards: the table body is tall, so it never gets clipped by the card.
 */
function Head({ label, tip, align = 'center' }: {label: string;tip: string;align?: keyof typeof headAlign;}) {
  return (
    <th scope="col" className={`${th} ${headAlign[align]}`}>
      <span
        tabIndex={0}
        className="group relative inline-flex cursor-help items-center gap-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/25">
        
        <span className="whitespace-nowrap">{label}</span>
        <InfoIcon className="h-3.5 w-3.5 shrink-0 text-subtle transition-colors group-hover:text-muted" aria-hidden />
        <span
          role="tooltip"
          className={`absolute top-full z-40 mt-1.5 hidden w-56 rounded-lg bg-ink px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-surface shadow-xl group-focus:block group-hover:block ${tipAlign[align]}`}>
          
          {tip}
        </span>
      </span>
    </th>);

}

const dash = <span className="text-subtle">--:--</span>;

/** Quiet word instead of an empty cell — explains why there is no value. */
function Note({ children, tone = 'muted' }: {children: React.ReactNode;tone?: 'muted' | 'neg';}) {
  return <span className={`text-[12px] font-medium ${tone === 'neg' ? 'text-absent-ink/80' : 'text-subtle'}`}>{children}</span>;
}

/** Dashed pill around a value — reads as "a computed figure", and lines up into columns of shapes. */
function Chip({ children, tone = 'plain' }: {children: React.ReactNode;tone?: 'plain' | 'pos' | 'neg';}) {
  const cls = tone === 'pos' ? 'border-present/50 text-present-ink' : tone === 'neg' ? 'border-absent/50 text-absent-ink' : 'border-line text-ink';
  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border border-dashed px-2 py-0.5 text-[12px] font-semibold ${cls}`}>
      {children}
    </span>);

}

/** Nothing at all to report for this day — a quiet dashed dot instead of an empty cell. */
function EmptyCell() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-line text-[11px] text-subtle">
      -
    </span>);

}

/** Minutes that pay (early arrival from 10 min, overtime from 15 min). */
const bonusMinutes = (r: DayRecord) =>
[r.earlyIn && r.earlyIn >= 10 ? ts('common.minutesEarlyIn', { min: r.earlyIn }) : null,
r.overtime && r.overtime >= 15 ? ts('common.minutesOvertime', { min: r.overtime }) : null].
filter(Boolean) as string[];

/** Every minute late or left early is charged. */
const fineMinutes = (r: DayRecord) =>
[r.lateIn ? ts('common.minutesLate', { min: r.lateIn }) : null,
r.earlyOut ? ts('common.minutesEarlyOut', { min: r.earlyOut }) : null].
filter(Boolean) as string[];

/** Only past workdays can be corrected — a day off or a day that hasn't come yet has no clock times. */
const editable = (r: DayRecord) => r.status !== 'off' && r.status !== 'future';

/** What a clock column says when the camera recorded nothing — a word, never a blank. */
function clockNote(r: DayRecord, kind: 'in' | 'out') {
  if (r.status === 'future') return dash;
  if (r.status === 'absent') return kind === 'in' ? <Note tone="neg">{ts('data.dayStateShort.absent')}</Note> : <Note>—</Note>;
  return <Note>—</Note>;
}

interface AttendanceTableProps {
  employee: Employee;
  month: Date;
  records: DayRecord[];
  stats: MonthStats;
  onSaveTimes: (day: Date, times: TimeOverride) => void;
  onResetTimes: (day: Date) => void;
}

export function AttendanceTable({ employee, month, records, stats, onSaveTimes, onResetTimes }: AttendanceTableProps) {
  const t = useTranslations('details.table');
  const { g } = useGloss();
  const [selected, setSelected] = useState<DayRecord | null>(null);
  const [editing, setEditing] = useState<DayRecord | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{t('title')}</h2>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label={t('legendAria')}>
          {legend.map(({ key, bar }) =>
          <li key={key} className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className={`h-1.5 w-6 rounded-full ${bar}`} aria-hidden />
              {t(key)}
            </li>
          )}
        </ul>
        <span className="text-xs font-medium text-subtle">{monthLabel(records[0].day)}</span>
      </div>

      <p className="text-xs text-subtle">
        {t('hintBefore')} <span className="inline-flex translate-y-0.5 items-center"><InfoIcon className="h-3 w-3" aria-hidden /></span> {t('hintAfter')}
      </p>

      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className={`${th} w-[86px] pl-3 text-left`}>
                <span className="whitespace-nowrap">{t('col.day')}</span>
              </th>
              <Head align="center" label={t('col.shift')} tip={t('tip.shift')} />
              <Head align="center" label={t('col.in')} tip={t('tip.in')} />
              <Head align="center" label={t('col.out')} tip={t('tip.out')} />
              <Head align="center" label={t('col.status')} tip={t('tip.status')} />
              <Head align="center" label={t('col.bonusTime')} tip={t('tip.bonusTime')} />
              <Head align="center" label={t('col.fineTime')} tip={t('tip.fineTime')} />
              <Head align="center" label={t('col.worked')} tip={t('tip.worked')} />
              <Head align="center" label={t('col.bonus')} tip={t('tip.bonus')} />
              <Head align="center" label={t('col.fine')} tip={t('tip.fine')} />
              <Head align="center" label={t('col.pay')} tip={t('tip.pay')} />
              <Head align="center" label={t('col.actions')} tip={t('tip.actions')} />
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const key = r.day.toISOString();
              const dim = r.status === 'off' || r.status === 'future';
              const bonusMin = bonusMinutes(r);
              const fineMin = fineMinutes(r);
              const arrived = r.status === 'present' || r.status === 'late';
              return (
                <tr
                  key={key}
                  onClick={() => setSelected(r)}
                  onKeyDown={(e) => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();setSelected(r);}}}
                  tabIndex={0}
                  className={`cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/20 ${rowTint[r.status]}`}>

                  <td className={`${td} whitespace-nowrap border-l-4 pl-3 ${accent[r.status]}`}>
                    <div className="font-bold text-ink">{formatDayNum(r.day)}</div>
                    <div className="text-[11px] font-medium text-subtle">{weekdayShort(r.day)}</div>
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.status === 'off' ? <Note>{ts('data.dayState.off')}</Note> :
                    r.reqIn ? <>
                        <div className="font-semibold text-ink">
                          {r.reqIn}<span className="mx-1 font-normal text-subtle">–</span>{r.reqOut}
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <span className={`rounded px-1.5 py-px text-[10px] font-semibold ${workTypeTone[r.calc.workType]}`}>{g(r.calc.workType)}</span>
                          {r.shiftLabel && <span className="text-[10px] text-subtle">{r.shiftLabel}</span>}
                        </div>
                      </> :
                    <Note>{r.calc.offRule}</Note>
                    }
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.checkIn ? <span className="font-semibold text-ink">{r.checkIn}</span> : clockNote(r, 'in')}
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.checkOut ? <span className="font-semibold text-ink">{r.checkOut}</span> :
                    r.checkIn ? <Note>{ts('common.notSet')}</Note> : clockNote(r, 'out')}
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.status === 'future' ? <Note>{ts('data.dayState.future')}</Note> :
                    <span className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${dayState[r.status].cls}`}>
                          {dayState[r.status].text}
                        </span>
                        {r.manual && <span className="text-[10px] font-semibold text-late-ink">{t('manualTag')}</span>}
                      </span>
                    }
                  </td>

                  <td className={`${td} text-center`}>
                    {bonusMin.length ?
                    <div className="flex flex-col items-center gap-1">
                        {bonusMin.map((t) => <Chip key={t} tone="pos">{t}</Chip>)}
                      </div> :
                    dim ? <EmptyCell /> : <Note>—</Note>
                    }
                  </td>

                  <td className={`${td} text-center`}>
                    {fineMin.length ?
                    <div className="flex flex-col items-center gap-1">
                        {fineMin.map((t) => <Chip key={t} tone="neg">{t}</Chip>)}
                      </div> :
                    dim ? <EmptyCell /> : <Note>—</Note>
                    }
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {arrived ? <Chip>{workedLabel(r)}</Chip> : <EmptyCell />}
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.bonus ? <Chip tone="pos">{ts('common.money', { amount: formatMoney(r.bonus) })}</Chip> : dim ? <EmptyCell /> : <Note>{t('zero')}</Note>}
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.fine ? <Chip tone="neg">{ts('common.money', { amount: formatMoney(r.fine) })}</Chip> : dim ? <EmptyCell /> : <Note>{t('zero')}</Note>}
                  </td>

                  <td className={`${td} whitespace-nowrap text-center`}>
                    {r.status === 'absent' ? <Chip tone="neg">{t('zero')}</Chip> :
                    dim ? <EmptyCell /> : <Chip>{ts('common.money', { amount: formatMoney(r.pay ?? 0) })}</Chip>}
                  </td>

                  <td className={`${td} whitespace-nowrap pr-3 text-center`} onClick={(e) => e.stopPropagation()}>
                    {editable(r) ?
                    <span className="inline-flex items-center gap-1.5">
                        <IconButton
                          icon={<PencilIcon className="h-4 w-4" aria-hidden />}
                          label={t('actionView')}
                          onClick={() => setSelected(r)}
                          className="border border-line text-muted hover:bg-canvas hover:text-ink" />

                        <IconButton
                          icon={<ClockIcon className="h-4 w-4" aria-hidden />}
                          label={r.manual ? t('actionEditAgain') : t('actionEdit')}
                          onClick={() => setEditing(r)}
                          className={`border ${r.manual ? 'border-dashed border-late/60 text-late-ink hover:bg-late-soft' : 'border-line text-muted hover:bg-canvas hover:text-ink'}`} />
                      </span> :

                    <EmptyCell />
                    }
                  </td>
                </tr>);

            }
            )}
          </tbody>
          <tfoot>
            <tr className="bg-surface-2">
              <td className={`${td} whitespace-nowrap border-t-2 border-t-line pl-3 font-semibold text-ink`} colSpan={7}>
                {t('footerTotal', { month: monthLabel(records[0].day), days: stats.workdays })}
              </td>
              <td className={`${td} whitespace-nowrap border-t-2 border-t-line text-center font-semibold text-ink`}>{fmtDuration(Math.round(stats.totalHours * 60))}</td>
              <td className={`${td} whitespace-nowrap border-t-2 border-t-line text-center font-semibold text-present-ink`}>{formatMoney(stats.totalBonus)}</td>
              <td className={`${td} whitespace-nowrap border-t-2 border-t-line text-center font-semibold text-absent-ink`}>{formatMoney(stats.totalFine)}</td>
              <td className={`${td} whitespace-nowrap border-t-2 border-t-line text-center font-bold text-ink`}>{formatMoney(stats.totalPay)}</td>
              <td className={`${td} border-t-2 border-t-line pr-3`} />
            </tr>
          </tfoot>
        </table>
      </div>

      <DayDetailModal record={selected} onClose={close} />

      <EditDayTimesModal
        employee={employee}
        month={month}
        record={editing}
        onClose={closeEdit}
        onSave={(day, times) => {onSaveTimes(day, times);setEditing(null);}}
        onReset={(day) => {onResetTimes(day);setEditing(null);}} />
    </div>);
}
