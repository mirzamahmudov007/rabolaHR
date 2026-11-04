'use client';
import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { addMonths, startOfMonth } from 'date-fns';
import { ArrowLeftIcon, BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { employees } from '@/shared/data/employees';
import { statusMeta } from '@/shared/data/attendanceStatuses';
import { TODAY, formatIso } from '@/shared/utils/date';
import { t as ts } from '@/shared/i18n/static';
import { useGloss } from '@/shared/i18n/format';
import { IconButton } from '@/shared/ui/IconButton';
import { Tabs } from '@/shared/ui/Tabs';
import { buildMonth, summarize, monthLabel, employeeContact, timeKey } from '@/features/employee-details/utils/attendance';
import type { TimeOverride } from '@/features/employee-details/utils/attendance';
import { ProfileHeader } from '@/features/employee-details/components/ProfileHeader';
import { EmployeeActions } from '@/features/employee-details/components/EmployeeActions';
import { StatCards } from '@/features/employee-details/components/StatCards';
import { AttendanceCalendar } from '@/features/employee-details/components/AttendanceCalendar';
import { AttendanceTable } from '@/features/employee-details/components/AttendanceTable';
import { InfoSection } from '@/features/employee-details/components/InfoSection';
import type { InfoRow } from '@/features/employee-details/components/InfoSection';

const thisMonth = startOfMonth(TODAY);
type TabKey = 'info' | 'attendance';

export function EmployeeDetails({ id }: { id: string }) {
  const t = useTranslations('details');
  const tu = useTranslations('ui');
  const { g, locale } = useGloss();
  const employee = employees.find((e) => e.id === id) ?? null;
  const [month, setMonth] = useState(() => startOfMonth(TODAY));
  const [tab, setTab] = useState<TabKey>('info');
  /** Clock times corrected by hand, keyed per day — they survive month switching. */
  const [overrides, setOverrides] = useState<Record<string, TimeOverride>>({});

  // The records carry generated, language-dependent explanations, so they are
  // rebuilt whenever the interface language changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- locale is consumed indirectly via static t()
  const records = useMemo(() => (employee ? buildMonth(employee, month, overrides) : []), [employee, month, overrides, locale]);
  const stats = useMemo(() => summarize(records), [records]);

  const saveTimes = useCallback((day: Date, times: TimeOverride) =>
  setOverrides((prev) => ({ ...prev, [timeKey(day)]: { ...prev[timeKey(day)], ...times } })), []);

  const resetTimes = useCallback((day: Date) =>
  setOverrides((prev) => {
    const next = { ...prev };delete next[timeKey(day)];return next;
  }), []);

  if (!employee) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface p-12 text-center shadow-card">
        <h1 className="text-lg font-semibold text-ink">{t('notFoundTitle')}</h1>
        <p className="text-sm text-muted">{t('notFoundDesc', { id })}</p>
        <Link href="/" className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden /> {t('backToList')}
        </Link>
      </div>);

  }

  const meta = statusMeta[employee.status];
  const contact = employeeContact(employee);
  const others = employee.otherBranches ?? [];
  const canGoNext = month.getTime() < thisMonth.getTime();

  const statusBadge =
  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold ${meta.badgeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
      {g(meta.badge)}
    </span>;


  const personal: InfoRow[] = [
  { label: t('info.fullName'), value: g(employee.name) },
  { label: t('info.employeeId'), value: employee.code },
  { label: t('info.joined'), value: formatIso(employee.joined) },
  { label: t('info.currentStatus'), value: statusBadge }];


  const work: InfoRow[] = [
  { label: t('info.position'), value: g(employee.position) },
  { label: t('info.branch'), value: g(employee.branch) },
  { label: t('info.otherBranches'), value: others.length ? others.map(g).join(', ') : ts('common.none') },
  { label: t('info.workType'), value: g(employee.workType) },
  { label: t('info.schedule'), value: g(employee.workTypeNote) },
  { label: t('info.workHours'), value: employee.workHours }];


  const contacts: InfoRow[] = [
  { label: t('info.email'), value: contact.email },
  { label: t('info.phone'), value: contact.phone }];


  const monthNav =
  <div className="mb-[-1px] flex items-center gap-1 pb-2">
      <IconButton icon={<ChevronLeftIcon className="h-4 w-4" aria-hidden />} label={tu('prevMonth')} onClick={() => setMonth((m) => addMonths(m, -1))} />
      <span className="w-28 text-center text-sm font-semibold text-ink">{monthLabel(month)}</span>
      <IconButton icon={<ChevronRightIcon className="h-4 w-4" aria-hidden />} label={tu('nextMonth')} onClick={() => canGoNext && setMonth((m) => addMonths(m, 1))} disabled={!canGoNext} />
    </div>;


  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted transition-colors duration-150 hover:text-ink">
          
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          {t('backToList')}
        </Link>

        <EmployeeActions employee={employee} overrides={overrides} />
      </div>

      <ProfileHeader employee={employee} />

      <section className="rounded-xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-2">
          <Tabs
            label={t('viewAria')}
            value={tab}
            onChange={(k) => setTab(k as TabKey)}
            items={[
            { key: 'info', label: t('tabInfo') },
            { key: 'attendance', label: t('tabAttendance'), count: stats.workdays }]} />
          
          {monthNav}
        </div>
        <div className="p-4 md:p-5">
          {tab === 'attendance' &&
          <AttendanceTable
            employee={employee}
            month={month}
            records={records}
            stats={stats}
            onSaveTimes={saveTimes}
            onResetTimes={resetTimes} />}

          {tab === 'info' &&
          <div className="space-y-6">
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <StatCards stats={stats} month={monthLabel(month)} />
                <AttendanceCalendar records={records} />
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoSection title={t('sections.personal')} icon={<UserIcon className="h-4 w-4 text-subtle" aria-hidden />} rows={personal} />
                <InfoSection title={t('sections.work')} icon={<BriefcaseIcon className="h-4 w-4 text-subtle" aria-hidden />} rows={work} />
                <InfoSection title={t('sections.contacts')} icon={<PhoneIcon className="h-4 w-4 text-subtle" aria-hidden />} rows={contacts} />
              </div>
            </div>
          }
        </div>
      </section>
    </div>);

}
