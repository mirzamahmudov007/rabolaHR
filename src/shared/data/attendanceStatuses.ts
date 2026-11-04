import type { AttendanceStatus } from '@/shared/types/employee';

export const statusOrder: AttendanceStatus[] = ['present', 'late', 'absent', 'leave'];

export const statusMeta: Record<
  AttendanceStatus,
  {label: string;badge: string;hex: string;dot: string;badgeClass: string;}> =
{
  present: {
    label: 'Ishga kelganlar',
    badge: 'Keldi',
    hex: '#3f9d6f',
    dot: 'bg-present',
    badgeClass: 'bg-present-soft text-present-ink'
  },
  late: {
    label: 'Kechikib kelganlar',
    badge: 'Kechikdi',
    hex: '#cc8f33',
    dot: 'bg-late',
    badgeClass: 'bg-late-soft text-late-ink'
  },
  absent: {
    label: 'Ishga kelmaganlar',
    badge: 'Kelmadi',
    hex: '#d0584f',
    dot: 'bg-absent',
    badgeClass: 'bg-absent-soft text-absent-ink'
  },
  leave: {
    label: 'Dam olishda',
    badge: 'Dam olishda',
    hex: '#7d70c8',
    dot: 'bg-leave',
    badgeClass: 'bg-leave-soft text-leave-ink'
  }
};