import type { LogEvent } from '@/features/monitoring/types/faceLog';

export const logEventOrder: LogEvent[] = ['in', 'out', 'unknown'];

export const logEventMeta: Record<LogEvent, {label: string;tab: string;badgeClass: string;dot: string;direction: string;}> = {
  in: {
    label: 'Keldi',
    tab: 'Keldi',
    badgeClass: 'bg-present-soft text-present-ink',
    dot: 'bg-present',
    direction: 'Kirish'
  },
  out: {
    label: 'Ketdi',
    tab: 'Ketdi',
    badgeClass: 'bg-type-regular-soft text-type-regular-ink',
    dot: 'bg-type-regular-ink',
    direction: 'Chiqish'
  },
  unknown: {
    label: 'Begona',
    tab: 'Begona shaxslar',
    badgeClass: 'bg-absent-soft text-absent-ink',
    dot: 'bg-absent',
    direction: 'Aniqlanmadi'
  }
};

/** Minimum similarity for a face to be matched to an employee. */
export const MATCH_THRESHOLD = 80;

/** Matches below this are accepted but flagged for manual review. */
export const LOW_CONFIDENCE = 90;