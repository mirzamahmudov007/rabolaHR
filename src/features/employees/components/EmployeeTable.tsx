'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BuildingIcon, SearchXIcon } from 'lucide-react';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/ui/Button';
import { BranchListDialog } from '@/features/employees/components/BranchListDialog';
import { useDateFmt, useGloss } from '@/shared/i18n/format';
import type { Employee, WorkType } from '@/shared/types/employee';

interface EmployeeTableProps {
  employees: Employee[];
  total: number;
  onReset: () => void;
  hideBranch?: boolean;
  emptyBranch?: string | null;
}

const allColumns = ['employee', 'branch', 'workType', 'workHours', 'joined', 'checkIn', 'checkOut'] as const;

const workTypeClass: Record<WorkType, string> = {
  Oddiy: 'bg-type-regular-soft text-type-regular-ink ring-1 ring-inset ring-type-regular-ink/15',
  Smenali: 'bg-type-shift-soft text-type-shift-ink ring-1 ring-inset ring-type-shift-ink/15',
  Sikl: 'bg-type-cycle-soft text-type-cycle-ink ring-1 ring-inset ring-type-cycle-ink/15'
};

export function EmployeeTable({ employees, total, onReset, hideBranch, emptyBranch }: EmployeeTableProps) {
  const t = useTranslations('employees');
  const { g } = useGloss();
  const dates = useDateFmt();
  const columns = hideBranch ? allColumns.filter((c) => c !== 'branch') : allColumns;
  const [branchDetail, setBranchDetail] = useState<Employee | null>(null);
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-y border-line bg-surface-2">
              {columns.map((c) =>
              <th key={c} scope="col" className="whitespace-nowrap px-4 py-2.5 text-xs font-semibold text-muted first:pl-5">
                  {t(`col.${c}`)}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {employees.map((e) =>
            <tr key={e.id} className="border-b border-line transition-colors duration-150 last:border-0 hover:bg-surface-2">
                <td className="py-3 pl-5 pr-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={g(e.name)} src={e.photo} />
                    <div className="leading-tight">
                      <Link
                        href={`/xodimlar/${e.id}`}
                        className="whitespace-nowrap font-bold text-ink transition-colors duration-150 hover:text-brand hover:underline">
                        {g(e.name)}
                      </Link>
                      <div className="mt-0.5 text-xs text-subtle">{g(e.position)}</div>
                    </div>
                  </div>
                </td>
                {!hideBranch &&
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                    <div className="flex items-center gap-1.5">
                      <span>{g(e.branch)}</span>
                      {e.otherBranches && e.otherBranches.length > 0 &&
                  <button
                    type="button"
                    onClick={() => setBranchDetail(e)}
                    className="inline-flex items-center rounded-md border border-line bg-surface-2 px-1.5 text-xs font-semibold text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink"
                    aria-label={t('viewAllBranches', { name: g(e.name), count: 1 + e.otherBranches.length })}>
                    
                        +{e.otherBranches.length}
                      </button>
                  }
                    </div>
                  </td>
                }
                <td className="whitespace-nowrap px-4 py-3 leading-tight">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${workTypeClass[e.workType]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                    {g(e.workType)}
                  </span>
                  <div className="mt-1 text-xs text-subtle">{g(e.workTypeNote)}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-body">{e.workHours}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">{dates.formatIso(e.joined)}</td>
                <td className="whitespace-nowrap px-4 py-3 leading-tight">
                  {e.checkIn ?
                <>
                      <div className={`font-bold tabular-nums ${e.lateMinutes ? 'text-late-ink' : 'text-present-ink'}`}>
                        {e.checkIn}
                      </div>
                      {e.lateMinutes ?
                  <div className="mt-0.5 text-xs font-semibold text-late-ink">{t('lateMin', { min: e.lateMinutes })}</div> :

                  <div className="mt-0.5 text-xs text-subtle">{t('onTime')}</div>
                  }
                    </> :

                <span className="text-subtle">—</span>
                }
                </td>
                <td className="whitespace-nowrap px-4 py-3 pr-5">
                  {e.checkOut ?
                <span className="font-bold tabular-nums text-ink">{e.checkOut}</span> :
                e.checkIn ?
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-present-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-present" aria-hidden />
                      {t('atWork')}
                    </span> :

                <span className="text-subtle">—</span>
                }
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {employees.length === 0 && emptyBranch &&
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <BuildingIcon className="h-7 w-7 text-subtle" aria-hidden />
            <p className="mt-3 text-sm font-bold text-ink">{t('empty.branchTitle', { branch: g(emptyBranch) })}</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              {t('empty.branchHint')}
            </p>
          </div>
        }

        {employees.length === 0 && !emptyBranch &&
        <div className="flex flex-col items-center px-6 py-14 text-center">
            <SearchXIcon className="h-7 w-7 text-subtle" aria-hidden />
            <p className="mt-3 text-sm font-bold text-ink">{t('empty.searchTitle')}</p>
            <p className="mt-1 text-sm text-muted">{t('empty.searchHint')}</p>
            <Button onClick={onReset} variant="secondary" className="mt-4 px-4 font-bold">
              {t('empty.reset')}
            </Button>
          </div>
        }
      </div>
      <div className="border-t border-line px-5 py-3 text-sm text-muted">
        {t('footer', { shown: employees.length, total })}
      </div>
      <BranchListDialog employee={branchDetail} onClose={() => setBranchDetail(null)} />
    </>);

}