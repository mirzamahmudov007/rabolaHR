'use client';
import React from 'react';
import { LogInIcon, LogOutIcon, ShieldAlertIcon } from 'lucide-react';
import { logEventMeta } from '@/features/monitoring/data/logEvents';
import { useGloss } from '@/shared/i18n/format';
import type { LogEvent } from '@/features/monitoring/types/faceLog';

const icons: Record<LogEvent, typeof LogInIcon> = {
  in: LogInIcon,
  out: LogOutIcon,
  unknown: ShieldAlertIcon
};

export function EventBadge({ event }: {event: LogEvent;}) {
  const { g } = useGloss();
  const Icon = icons[event];
  const meta = logEventMeta[event];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {g(meta.label)}
    </span>);

}