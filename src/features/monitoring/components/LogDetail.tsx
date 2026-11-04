'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/Button';
import {
  AlertTriangleIcon,
  CheckCheckIcon,
  CheckCircle2Icon,
  MousePointerClickIcon,
  ShieldAlertIcon,
  UserPlusIcon,
  UserXIcon } from
'lucide-react';
import { EventBadge } from '@/features/monitoring/components/EventBadge';
import { CaptureImage } from '@/features/monitoring/components/CaptureImage';
import { useGloss } from '@/shared/i18n/format';
import { formatDay, TODAY } from '@/shared/utils/date';
import { employees } from '@/shared/data/employees';
import { LOW_CONFIDENCE, MATCH_THRESHOLD, logEventMeta } from '@/features/monitoring/data/logEvents';
import type { FaceLog } from '@/features/monitoring/types/faceLog';

interface LogDetailProps {
  log: FaceLog | null;
  history: FaceLog[];
  reviewed: boolean;
  onReview: (id: string) => void;
}

export function LogDetail({ log, history, reviewed, onReview }: LogDetailProps) {
  const tm = useTranslations('monitoring');
  const td = useTranslations('monitoring.detail');
  const tc = useTranslations('common');
  const { g } = useGloss();
  if (!log) {
    return (
      <aside className="flex flex-col items-center rounded-xl border border-line bg-surface px-6 py-16 text-center shadow-card">
        <MousePointerClickIcon className="h-6 w-6 text-subtle" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-ink">{td('pickTitle')}</p>
        <p className="mt-1 text-sm text-muted">{td('pickDesc')}</p>
      </aside>);

  }

  const emp = log.employeeId ? employees.find((e) => e.id === log.employeeId) : undefined;
  const isUnknown = log.event === 'unknown';
  const isLowConfidence = !isUnknown && log.similarity < LOW_CONFIDENCE;
  const sim = Math.round(log.similarity * 10) / 10;
  const tone = isUnknown ?
  { text: 'text-absent-ink', bar: 'bg-absent' } :
  isLowConfidence ?
  { text: 'text-late-ink', bar: 'bg-late' } :
  { text: 'text-present-ink', bar: 'bg-present' };

  const meta: [string, string][] = [
  ...(emp ? [[tm('meta.employee'), `${emp.name} · ${emp.code}`], [tm('meta.position'), g(emp.position)]] as [string, string][] : []),
  [tm('meta.branch'), g(log.branch)],
  [tm('meta.device'), g(log.camera)],
  [tm('meta.direction'), g(logEventMeta[log.event].direction)],
  [tm('meta.eventId'), log.id]];


  return (
    <aside className="overflow-hidden rounded-xl border border-line bg-surface shadow-card" aria-label={td('eventAria')}>
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="text-xs text-muted">{tc('today')}, {formatDay(TODAY)}</div>
          <div className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight text-ink">{log.time}</div>
          <div className={`mt-1 truncate text-sm font-medium ${isUnknown ? 'text-absent-ink' : 'text-body'}`}>
            {emp?.name ?? tm('unknownPerson')}
          </div>
        </div>
        <EventBadge event={log.event} />
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <figure className="min-w-0">
          <CaptureImage
            src={log.capture}
            alt={tm('altCapturePlain')}
            iconClassName="h-6 w-6"
            className={`aspect-square w-full rounded-lg ${isUnknown ? 'ring-2 ring-absent/70' : 'ring-1 ring-line'}`} />
          
          <figcaption className="mt-1.5 text-xs text-muted">{td('cameraCapture')}</figcaption>
        </figure>
        <figure className="min-w-0">
          {emp?.photo ?
          <CaptureImage
            src={emp.photo}
            alt={td('basePhotoAlt', { name: emp.name })}
            iconClassName="h-6 w-6"
            className="aspect-square w-full rounded-lg ring-1 ring-line" /> :


          <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface-2 px-3 text-center">
              <UserXIcon className="h-6 w-6 text-subtle" aria-hidden />
              <span className="mt-2 text-xs leading-snug text-muted">
                {emp ? td('noEmployeePhoto') : tm('noFaceInBase')}
              </span>
            </div>
          }
          <figcaption className="mt-1.5 text-xs text-muted">{td('basePhoto')}</figcaption>
        </figure>
      </div>

      <div className="px-5 pb-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-medium text-body">{tm('similarityTitle')}</span>
          <span className={`text-sm font-semibold tabular-nums ${tone.text}`}>{sim}%</span>
        </div>
        <div className="relative mt-2 h-1.5 rounded-full bg-field">
          <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${sim}%` }} />
          <span className="absolute -top-1 h-3.5 w-px bg-ink/50" style={{ left: `${MATCH_THRESHOLD}%` }} aria-hidden />
        </div>
        <div className="mt-1.5 text-xs text-subtle">{td('thresholdLine', { pct: MATCH_THRESHOLD })}</div>
      </div>

      {isLowConfidence &&
      <div className="mx-5 mb-5 flex items-start gap-2.5 rounded-lg border border-late/25 bg-late-soft px-4 py-3">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-late-ink" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-late-ink">{td('lowTitle')}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-late-ink/80">
              {td('lowDesc', { pct: LOW_CONFIDENCE })}
            </p>
          </div>
        </div>
      }

      {isUnknown && !reviewed &&
      <div className="mx-5 mb-5 rounded-lg border border-absent/25 bg-absent-soft p-4">
          <div className="flex items-start gap-2.5">
            <ShieldAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-absent-ink" aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-absent-ink">{td('strangerTitle')}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-absent-ink/80">
                {td('strangerDesc', { pct: MATCH_THRESHOLD })}
              </p>
            </div>
          </div>
          <div className="mt-3.5 grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Button
            onClick={() =>
            toast(td('toastOpenForm'), { description: td('toastAttachPhoto') })
            }
            className="whitespace-nowrap"
            icon={<UserPlusIcon className="h-4 w-4 shrink-0" aria-hidden />}>
            
              {td('addEmployee')}
            </Button>
            <Button
            onClick={() => onReview(log.id)}
            variant="secondary"
            className="whitespace-nowrap"
            icon={<CheckCheckIcon className="h-4 w-4 shrink-0" aria-hidden />}>
            
              {td('markReviewed')}
            </Button>
          </div>
        </div>
      }

      {isUnknown && reviewed &&
      <div className="mx-5 mb-5 flex items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-4 py-3">
          <CheckCircle2Icon className="h-4 w-4 shrink-0 text-present-ink" aria-hidden />
          <div className="min-w-0 text-[13px]">
            <span className="font-semibold text-ink">{td('reviewedBadge')}</span>
            <span className="text-muted"> · Rabola Admin</span>
          </div>
        </div>
      }

      <dl className="border-t border-line px-5 py-3">
        {meta.map(([k, v]) =>
        <div key={k} className="flex items-center justify-between gap-4 py-1.5 text-[13px]">
            <dt className="shrink-0 text-muted">{k}</dt>
            <dd className="min-w-0 truncate text-right font-medium text-ink" title={v}>
              {v}
            </dd>
          </div>
        )}
      </dl>

      {emp &&
      <div className="border-t border-line px-5 py-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[13px] font-semibold text-ink">{td('activityToday')}</h3>
            <span className="text-xs tabular-nums text-subtle">{td('countTa', { count: history.length })}</span>
          </div>
          {history.length > 1 ?
        <ol className="relative mt-3 max-h-56 space-y-3 overflow-y-auto before:absolute before:bottom-1 before:left-[3px] before:top-1 before:w-px before:bg-line">
              {history.map((h) =>
          <li key={h.id} className="relative flex items-center gap-3 pl-5">
                  <span className={`absolute left-0 h-[7px] w-[7px] rounded-full ring-2 ring-surface ${logEventMeta[h.event].dot}`} aria-hidden />
                  <span className={`w-12 shrink-0 text-[13px] tabular-nums ${h.id === log.id ? 'font-semibold text-ink' : 'text-body'}`}>
                    {h.time.slice(0, 5)}
                  </span>
                  <span className={`text-[13px] ${h.id === log.id ? 'font-semibold text-ink' : 'text-body'}`}>
                    {g(logEventMeta[h.event].label)}
                  </span>
                  <span className="ml-auto min-w-0 truncate text-xs text-subtle">{g(h.camera)}</span>
                </li>
          )}
            </ol> :

        <p className="mt-2 text-[13px] text-muted">{td('noOther')}</p>
        }
        </div>
      }
    </aside>);

}