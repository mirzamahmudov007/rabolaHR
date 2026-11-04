'use client';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { employees } from '@/shared/data/employees';
import { branches } from '@/shared/data/branches';
import { AttendanceStats } from '@/features/employees/components/AttendanceStats';
import { EmployeeToolbar } from '@/features/employees/components/EmployeeToolbar';
import { EmployeeTable } from '@/features/employees/components/EmployeeTable';
import { FilterDialog } from '@/features/employees/components/FilterDialog';
import { emptyFilters } from '@/shared/types/employee';
import { TODAY } from '@/shared/utils/date';
import { useScreenInit } from '@/shared/lib/useScreenInit';
import { applyFilters, buildFilterOptions, countActiveFilters } from '@/features/employees/utils/employeeFilters';
import type { AttendanceStatus, EmployeeFilters } from '@/shared/types/employee';

export function Employees() {
  const t = useTranslations('employees');
  const screenInit = useScreenInit();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<Date>(TODAY);
  const [branch, setBranch] = useState<string | null>(screenInit.branch ?? null);
  const [filters, setFilters] = useState<EmployeeFilters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(screenInit.filtersOpen ?? false);

  const branchCounts = useMemo(() => {
    const c: Record<string, number> = {};
    employees.forEach((e) => c[e.branch] = (c[e.branch] ?? 0) + 1);
    return c;
  }, []);

  const scoped = useMemo(() => branch ? employees.filter((e) => e.branch === branch) : employees, [branch]);

  const counts = useMemo(() => {
    const c: Record<AttendanceStatus, number> = { present: 0, late: 0, absent: 0, leave: 0 };
    scoped.forEach((e) => c[e.status] += 1);
    return c;
  }, [scoped]);

  const options = useMemo(() => buildFilterOptions(employees), []);
  const filtered = useMemo(() => applyFilters(scoped, query, filters), [scoped, query, filters]);
  const closeFilters = useCallback(() => setFiltersOpen(false), []);

  return (
    <div className="space-y-5">
      <AttendanceStats counts={counts} total={scoped.length} />

      <section className="rounded-xl border border-line bg-surface shadow-card" aria-label={t('listAria')}>
        <EmployeeToolbar
          query={query}
          onQueryChange={setQuery}
          date={date}
          onDateChange={setDate}
          activeFilters={countActiveFilters(filters)}
          onOpenFilters={() => setFiltersOpen(true)}
          branches={branches}
          branchCounts={branchCounts}
          totalEmployees={employees.length}
          branch={branch}
          onBranchChange={setBranch} />
        
        <EmployeeTable
          employees={filtered}
          total={scoped.length}
          hideBranch={branch !== null}
          emptyBranch={branch && scoped.length === 0 ? branch : null}
          onReset={() => {
            setQuery('');
            setFilters(emptyFilters);
          }} />
        
      </section>

      <FilterDialog
        open={filtersOpen}
        value={filters}
        options={options}
        onClose={closeFilters}
        onApply={(f) => {
          setFilters(f);
          setFiltersOpen(false);
        }} />
      
    </div>);

}
