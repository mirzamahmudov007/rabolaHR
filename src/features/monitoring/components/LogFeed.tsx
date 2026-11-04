'use client';
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCheckIcon, ScanFaceIcon } from 'lucide-react';
import { EventBadge } from '@/features/monitoring/components/EventBadge';
import { CaptureImage } from '@/features/monitoring/components/CaptureImage';
import { LOW_CONFIDENCE } from '@/features/monitoring/data/logEvents';
import { useGloss } from '@/shared/i18n/format';
import { employees } from '@/shared/data/employees';
import type { FaceLog } from '@/features/monitoring/types/faceLog';

interface LogFeedProps {
  logs: FaceLog[];
  selectedId: string | null;
  freshId: string | null;
  reviewed: Set<string>;
  onSelect: (id: string) => void;
}

const byId = new Map(employees.map((e) => [e.id, e]));

export function LogFeed({ logs, selectedId, freshId, reviewed, onSelect }: LogFeedProps) {
  const tm = useTranslations('monitoring');
  const { g } = useGloss();
  const groups = useMemo(() => {
    const map = new Map<string, FaceLog[]>();
    logs.forEach((l) => {
      const hour = l.time.slice(0, 2);
      map.set(hour, [...(map.get(hour) ?? []), l]);
    });
    return Array.from(map.entries());
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <ScanFaceIcon className="h-7 w-7 text-subtle" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-ink">{tm('emptyTitle')}</p>
        <p className="mt-1 text-sm text-muted">{tm('emptyDesc')}</p>
      </div>);

  }

  return (
    <div role="listbox" aria-label={tm('feedAria')}>
      {groups.map(([hour, list]) =>
      <div key={hour}>
          <div className="sticky top-16 z-10 flex items-center justify-between border-y border-line bg-surface-2 px-5 py-1.5 text-xs text-muted">
            <span className="font-semibold tabular-nums text-body">
              {hour}:00 – {String((Number(hour) + 1) % 24).padStart(2, '0')}:00
            </span>
            <span className="tabular-nums">{tm('eventCount', { count: list.length })}</span>
          </div>
          {list.map((log) => {
          const emp = log.employeeId ? byId.get(log.employeeId) : undefined;
          const isSelected = log.id === selectedId;
          const isUnknown = log.event === 'unknown';
          return (
            <motion.button
              key={log.id}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(log.id)}
              initial={log.id === freshId ? { opacity: 0, y: -6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className={`relative grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 border-b border-line px-5 py-3 text-left transition-colors duration-150 last:border-b-0 md:grid-cols-[48px_minmax(0,1.3fr)_96px_minmax(0,1fr)_64px_72px] ${
              isSelected ? 'bg-canvas' : 'hover:bg-surface-2'}`
              }>
              
                {isSelected && <span className="absolute inset-y-0 left-0 w-0.5 bg-ink" aria-hidden />}
                <span className="relative">
                  <CaptureImage
                  src={log.capture}
                  alt={emp ? tm('altCapture', { name: emp.name }) : tm('altUnknownCapture')}
                  className={`h-12 w-12 rounded-lg ${isUnknown ? 'ring-2 ring-absent/70' : 'ring-1 ring-line'}`} />
                
                  {log.id === freshId &&
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-present ring-2 ring-surface" aria-label={tm('new')} />
                }
                </span>

                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${isUnknown ? 'text-absent-ink' : 'text-ink'}`}>
                    {emp?.name ?? tm('unknownPerson')}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {emp ? `${emp.code} · ${g(emp.position)}` : reviewed.has(log.id) ?
                  <span className="inline-flex items-center gap-1">
                        <CheckCheckIcon className="h-3 w-3" aria-hidden /> {tm('reviewed')}
                      </span> :

                  tm('noFaceInBase')
                  }
                  </span>
                  <span className="mt-1 md:hidden">
                    <EventBadge event={log.event} />
                  </span>
                </span>

                <span className="hidden md:block">
                  <EventBadge event={log.event} />
                </span>

                <span className="hidden min-w-0 md:block">
                  <span className="block truncate text-[13px] text-body">{g(log.camera)}</span>
                  <span className="block truncate text-xs text-subtle">{g(log.branch)}</span>
                </span>

                <span
                className={`hidden text-right text-[13px] tabular-nums md:block ${
                isUnknown ?
                'font-semibold text-absent-ink' :
                log.similarity < LOW_CONFIDENCE ?
                'font-semibold text-late-ink' :
                'text-muted'}`
                }
                title={tm('similarityTitle')}>
                
                  {Math.round(log.similarity)}%
                </span>

                <span className="text-right text-sm font-semibold tabular-nums text-ink">{log.time}</span>
              </motion.button>);

        })}
        </div>
      )}
    </div>);

}