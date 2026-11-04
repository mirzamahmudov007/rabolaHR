'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { BriefcaseIcon } from 'lucide-react';
import { Avatar } from '@/shared/components/Avatar';
import { statusMeta } from '@/shared/data/attendanceStatuses';
import { useGloss } from '@/shared/i18n/format';
import type { Employee } from '@/shared/types/employee';

const Sep = () => <span className="text-line" aria-hidden>|</span>;

/** Compact identity strip — every detail lives in the "Ma'lumot" tab, so this only answers "who is this". */
export function ProfileHeader({ employee }: {employee: Employee;}) {
  const t = useTranslations('details');
  const { g } = useGloss();
  const meta = statusMeta[employee.status];
  const others = employee.otherBranches ?? [];

  return (
    <section
      className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface px-5 py-4 shadow-card"
      aria-label={t('profileAria')}>

      <Avatar name={employee.name} src={employee.photo} size="lg" />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[22px] font-bold tracking-tight text-ink">{g(employee.name)}</h1>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
            {g(meta.badge)}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
          <span className="font-medium text-body">{employee.code}</span>
          <Sep />
          <span>{g(employee.position)}</span>
          <Sep />
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseIcon className="h-3.5 w-3.5 text-subtle" aria-hidden />
            {g(employee.branch)}
            {others.length > 0 &&
            <span className="text-subtle">+{others.length}</span>
            }
          </span>
        </p>
      </div>
    </section>);

}
