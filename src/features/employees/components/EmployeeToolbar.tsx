'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { FilterIcon, SearchIcon } from 'lucide-react';
import { AddEmployeeButton } from '@/features/employees/components/AddEmployeeButton';
import { BranchSwitcher } from '@/shared/components/BranchSwitcher';
import { useGloss } from '@/shared/i18n/format';
import { ReportDownload } from '@/shared/components/ReportDownload';
import { DatePicker } from '@/shared/ui/DatePicker';
import { TextInput } from '@/shared/form/TextInput';
import type { Branch } from '@/shared/types/employee';

interface EmployeeToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  date: Date;
  onDateChange: (d: Date) => void;
  activeFilters: number;
  onOpenFilters: () => void;
  branches: Branch[];
  branchCounts: Record<string, number>;
  totalEmployees: number;
  branch: string | null;
  onBranchChange: (b: string | null) => void;
}

export function EmployeeToolbar({
  query,
  onQueryChange,
  date,
  onDateChange,
  activeFilters,
  onOpenFilters,
  branches,
  branchCounts,
  totalEmployees,
  branch,
  onBranchChange
}: EmployeeToolbarProps) {
  const t = useTranslations('employees');
  const tc = useTranslations('common');
  const td = useTranslations('data.branch');
  const { g } = useGloss();
  return (
    <div className="flex flex-wrap items-center gap-2.5 p-4">
      <BranchSwitcher
        branches={branches}
        counts={branchCounts}
        total={totalEmployees}
        value={branch}
        onChange={onBranchChange} />
      
      <TextInput
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={tc('search')}
        className="w-full sm:w-64"
        leading={<SearchIcon className="h-4 w-4" aria-hidden />} />
      <DatePicker value={date} onChange={onDateChange} />
      <button
        onClick={onOpenFilters}
        className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-sm font-medium transition-colors duration-150 ${
        activeFilters > 0 ? 'border-ink/30 bg-brand-soft text-ink' : 'border-line bg-surface text-ink hover:bg-canvas'}`
        }>
        
        <FilterIcon className="h-4 w-4" aria-hidden />
        {t('filters')}
        {activeFilters > 0 &&
        <span className="rounded bg-brand px-1.5 text-xs font-semibold text-on-brand">{activeFilters}</span>
        }
      </button>

      <div className="flex items-center gap-2.5 sm:ml-auto">
        <ReportDownload scopeLabel={branch ? g(branch) : td('all')} />
        <AddEmployeeButton />
      </div>
    </div>);

}