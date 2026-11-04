import { statusMeta, statusOrder } from '@/shared/data/attendanceStatuses';
import { text } from '@/shared/i18n/glossary';
import type { Employee, EmployeeFilters, FilterKey } from '@/shared/types/employee';

export interface FilterOption {
  /** Value kept in the filter state — always the stored (Uzbek) literal. */
  value: string;
  label: string;
}

/** Categories of the filter dialog; `labelKey` is a message key under `employees.dialog`. */
export const filterCategories: {key: FilterKey;labelKey: string;}[] = [
{ key: 'position', labelKey: 'categoryPosition' },
{ key: 'workType', labelKey: 'categoryWorkType' },
{ key: 'status', labelKey: 'categoryStatus' }];


const unique = (values: string[]) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

export function buildFilterOptions(list: Employee[]): Record<FilterKey, FilterOption[]> {
  const toOptions = (values: string[]) => unique(values).map((v) => ({ value: v, label: v }));
  return {
    position: toOptions(list.map((e) => e.position)),
    branch: toOptions(list.map((e) => e.branch)),
    workType: toOptions(list.map((e) => e.workType)),
    status: statusOrder.map((s) => ({ value: s, label: statusMeta[s].badge }))
  };
}

export function applyFilters(list: Employee[], query: string, filters: EmployeeFilters): Employee[] {
  const q = query.trim().toLowerCase();
  return list.filter((e) => {
    // Match the stored text and its translation, so a Russian/English query still finds people.
    if (q && ![e.name, e.code, e.position, text(e.name), text(e.position)].some((v) => v.toLowerCase().includes(q))) return false;
    return (Object.keys(filters) as FilterKey[]).every(
      (key) => filters[key].length === 0 || filters[key].includes(String(e[key]))
    );
  });
}

export function countActiveFilters(filters: EmployeeFilters): number {
  return Object.values(filters).reduce((sum, v) => sum + v.length, 0);
}