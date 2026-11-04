export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export type WorkType = 'Oddiy' | 'Smenali' | 'Sikl';

export interface Branch {
  id: string;
  name: string;
  region: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  photo?: string;
  position: string;
  branch: string;
  otherBranches?: string[];
  workType: WorkType;
  workTypeNote: string;
  workHours: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  lateMinutes?: number;
  joined: string;
}

export type FilterKey = 'position' | 'branch' | 'workType' | 'status';

export type EmployeeFilters = Record<FilterKey, string[]>;

export const emptyFilters: EmployeeFilters = { position: [], branch: [], workType: [], status: [] };
