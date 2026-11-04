'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { statusMeta, statusOrder } from '@/shared/data/attendanceStatuses';
import { useGloss } from '@/shared/i18n/format';
import type { AttendanceStatus } from '@/shared/types/employee';

interface AttendanceStatsProps {
  counts: Record<AttendanceStatus, number>;
  total: number;
}

export function AttendanceStats({ counts, total }: AttendanceStatsProps) {
  const t = useTranslations('employees');
  const tc = useTranslations('common.units');
  const { g } = useGloss();
  return (
    <section
      className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-surface shadow-card md:grid-cols-5"
      aria-label={t('statsAria')}>
      
      <div className="relative col-span-2 border-b border-line px-5 pb-6 pt-5 md:col-span-1 md:border-b-0 md:border-r">
        <div className="text-[13px] font-semibold text-muted">{t('totalEmployees')}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-ink">{total}</span>
          <span className="text-xs font-semibold text-subtle">{tc('people')}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex h-[3px] gap-px" aria-hidden>
          {statusOrder.map((s) =>
          counts[s] > 0 ?
          <span key={s} style={{ flexGrow: counts[s], background: statusMeta[s].hex }} /> :
          null
          )}
        </div>
      </div>

      {statusOrder.map((s, i) => {
        const pct = total ? Math.round(counts[s] / total * 100) : 0;
        const borders = [
        i < statusOrder.length - 1 ? 'md:border-r' : '',
        i % 2 === 0 ? 'border-r' : '',
        i < 2 ? 'border-b md:border-b-0' : ''].
        join(' ');
        return (
          <div key={s} className={`relative border-line px-5 pb-6 pt-5 ${borders}`}>
            <div className="flex items-center gap-2 whitespace-nowrap text-[13px] font-semibold text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: statusMeta[s].hex }} aria-hidden />
              {g(statusMeta[s].label)}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-ink">
                {counts[s]}
              </span>
              <span className="text-xs font-semibold tabular-nums text-subtle">{pct}%</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-field" aria-hidden>
              <div className="h-full" style={{ width: `${pct}%`, background: statusMeta[s].hex }} />
            </div>
          </div>);

      })}
    </section>);

}