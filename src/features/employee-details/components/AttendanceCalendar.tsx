'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { getDay, isSameDay } from 'date-fns';
import { TODAY, formatDate, weekdayShortNames } from '@/shared/utils/date';
import { t as ts } from '@/shared/i18n/static';
import type { DayRecord, DayStatus } from '@/features/employee-details/utils/attendance';

const cellStyle: Record<DayStatus, string> = {
  present: 'bg-present-soft text-present-ink',
  late: 'bg-late-soft text-late-ink',
  absent: 'bg-absent-soft text-absent-ink',
  leave: 'bg-leave-soft text-leave-ink',
  off: 'bg-field text-subtle',
  future: 'text-subtle/40'
};

const legendLabel = (s: DayStatus) =>
s === 'off' ? ts('details.table.legendOff') : s === 'future' ? ts('details.calendar.upcoming') : ts(`data.dayState.${s}`);

export function AttendanceCalendar({ records }: { records: DayRecord[]; }) {
  const t = useTranslations('details.calendar');
  const offset = (getDay(records[0].day) + 6) % 7; // Monday-first

  return (
    <div aria-label={t('title')}>
      <h2 className="mb-3 text-sm font-semibold text-ink">{t('title')}</h2>

      <div className="grid max-w-[340px] grid-cols-7 gap-1">
        {weekdayShortNames().map((w) =>
        <div key={w} className="pb-1 text-center text-[11px] font-semibold text-subtle">{w}</div>
        )}
        {Array.from({ length: offset }).map((_, i) =>
        <div key={`b${i}`} />
        )}
        {records.map((r) => {
          const isToday = isSameDay(r.day, TODAY);
          const detail =
          r.status === 'present' || r.status === 'late' ?
          ` · ${ts('common.range', { from: r.checkIn ?? '', to: r.checkOut ?? '' })}${r.status === 'late' ? ` ${t('late', { min: r.lateMinutes ?? 0 })}` : ''}` :
          '';
          return (
            <div
              key={r.day.toISOString()}
              title={`${formatDate(r.day)} · ${legendLabel(r.status)}${detail}`}
              className={`flex aspect-square flex-col items-center justify-center rounded-md text-[13px] font-medium tabular-nums transition-colors duration-150 ${cellStyle[r.status]} ${
              isToday ? 'ring-2 ring-ink' : ''}`
              }>
              
              {r.day.getDate()}
            </div>);

          }
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-line pt-3">
        {(['present', 'late', 'absent', 'leave', 'off'] as DayStatus[]).map((s) =>
        <span key={s} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <span className={`h-3 w-3 rounded ${cellStyle[s]}`} aria-hidden />
            {legendLabel(s)}
          </span>
        )}
      </div>
    </div>);

}
