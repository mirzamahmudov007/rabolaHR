'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { statusMeta, statusOrder } from '@/shared/data/attendanceStatuses';
import { t as ts } from '@/shared/i18n/static';
import { useGloss } from '@/shared/i18n/format';
import { formatMoney } from '@/shared/utils/employeeForm';
import type { MonthStats } from '@/features/employee-details/utils/attendance';

function Row({ label, value, tone }: {label: string;value: React.ReactNode;tone?: 'pos' | 'neg';}) {
  const c = tone === 'pos' ? 'text-present-ink' : tone === 'neg' ? 'text-absent-ink' : 'text-ink';
  return (
    <div className="flex items-center justify-between gap-3 py-[5px] text-[13px]">
      <span className="text-muted">{label}</span>
      <span className={`font-semibold tabular-nums ${c}`}>{value}</span>
    </div>);

}

function Group({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">{title}</div>
      {children}
    </div>);

}

export function StatCards({ stats, month }: {stats: MonthStats;month: string;}) {
  const t = useTranslations('details.stats');
  const { g } = useGloss();
  const money = (n: number) => ts('common.money', { amount: formatMoney(n) });
  return (
    <div className="space-y-4" aria-label={t('title')}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{t('title')}</h2>
        <span className="text-xs font-medium text-subtle">{month}</span>
      </div>

      {/* status counts */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statusOrder.map((s) =>
        <div key={s} className="rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: statusMeta[s].hex }} aria-hidden />
              {g(statusMeta[s].badge)}
            </div>
            <div className="mt-0.5 text-[19px] font-semibold leading-none tracking-tight tabular-nums text-ink">
              {ts('dates.days', { count: stats[s] })}
            </div>
          </div>
        )}
      </div>

      {/* rates + time + money, grouped so the tab reads as a real report */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Group title={t('groupRates')}>
          <Row label={t('workdays')} value={stats.workdays} />
          <Row label={t('attendance')} value={`${stats.attendanceRate}%`} />
          <Row label={t('onTime')} value={`${stats.onTimeRate}%`} />
        </Group>
        <Group title={t('groupWorktime')}>
          <Row label={t('totalWorked')} value={ts('common.duration.h', { h: stats.totalHours })} />
          <Row label={t('avgIn')} value={stats.avgCheckIn} />
          <Row label={t('avgOut')} value={stats.avgCheckOut} />
        </Group>
        <Group title={t('groupDiscipline')}>
          <Row label={t('totalLate')} value={`${stats.totalLateMin} ${ts('common.units.min')}`} tone="neg" />
          <Row label={t('overtime')} value={`${stats.totalOvertime} ${ts('common.units.min')}`} tone="pos" />
        </Group>
        <Group title={t('groupPay')}>
          <Row label={t('bonuses')} value={money(stats.totalBonus)} tone="pos" />
          <Row label={t('fines')} value={money(stats.totalFine)} tone="neg" />
          <Row label={t('calculated')} value={money(stats.totalPay)} />
        </Group>
      </div>
    </div>);

}
