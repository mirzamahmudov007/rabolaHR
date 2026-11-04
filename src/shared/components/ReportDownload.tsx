'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths } from
'date-fns';
import { toast } from 'sonner';
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, Loader2Icon } from 'lucide-react';
import { Calendar } from '@/shared/ui/Calendar';
import { Button } from '@/shared/ui/Button';
import { useDismiss } from '@/shared/hooks/useDismiss';
import { useScreenInit } from '@/shared/lib/useScreenInit';
import { useDateFmt } from '@/shared/i18n/format';
import { TODAY, formatRange, rangeLength } from '@/shared/utils/date';

export type ReportFormat = 'xlsx' | 'pdf';

/** Range shortcuts; the label is a `dates.*` message key resolved at render time. */
const presets: {key: string;range: () => [Date, Date];}[] = [
{ key: 'presetToday', range: () => [TODAY, TODAY] },
{ key: 'presetYesterday', range: () => [addDays(TODAY, -1), addDays(TODAY, -1)] },
{ key: 'presetThisWeek', range: () => [startOfWeek(TODAY, { weekStartsOn: 1 }), TODAY] },
{
  key: "presetLastWeek",
  range: () => {
    const s = startOfWeek(addDays(TODAY, -7), { weekStartsOn: 1 });
    return [s, endOfWeek(s, { weekStartsOn: 1 })];
  }
},
{ key: 'presetThisMonth', range: () => [startOfMonth(TODAY), TODAY] },
{ key: "presetLastMonth", range: () => [startOfMonth(subMonths(TODAY, 1)), endOfMonth(subMonths(TODAY, 1))] },
{ key: 'presetLast30', range: () => [addDays(TODAY, -29), TODAY] }];


interface ReportDownloadProps {
  /** Who/what the report covers — shown in the popover subtitle and the toast. */
  scopeLabel: string;
  /** Trigger label; defaults to `report.label`. */
  label?: string;
  /** Formats offered in the popover — pass a single one when only that export exists. */
  formats?: ReportFormat[];
  /** Called with the chosen range so the caller can produce the real file. */
  onDownload?: (from: Date, to: Date, format: ReportFormat) => void;
}

const formatOptions: {key: ReportFormat;label: string;icon: typeof FileSpreadsheetIcon;}[] = [
{ key: 'xlsx', label: 'Excel', icon: FileSpreadsheetIcon },
{ key: 'pdf', label: 'PDF', icon: FileTextIcon }];


/** Date-range popover used to export an attendance report. */
export function ReportDownload({ scopeLabel, label, formats = ['xlsx', 'pdf'], onDownload }: ReportDownloadProps) {
  const t = useTranslations('report');
  const tc = useTranslations('common');
  const td = useTranslations('dates');
  const dates = useDateFmt();
  const screenInit = useScreenInit();
  const [open, setOpen] = useState<boolean>(screenInit.reportOpen ?? false);
  const [from, setFrom] = useState<Date | null>(startOfMonth(TODAY));
  const [to, setTo] = useState<Date | null>(TODAY);
  const [hovered, setHovered] = useState<Date | null>(null);
  const [month, setMonth] = useState(startOfMonth(subMonths(TODAY, 1)));
  const [fmt, setFmt] = useState<ReportFormat>(formats[0] ?? 'xlsx');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => !loading && setOpen(false), [loading]);
  useDismiss(ref, open, close);

  const selectDay = (d: Date) => {
    if (!from || to) {
      setFrom(d);
      setTo(null);
    } else if (isBefore(d, from)) {
      setTo(from);
      setFrom(d);
    } else {
      setTo(d);
    }
  };

  const applyPreset = (r: [Date, Date]) => {
    setFrom(r[0]);
    setTo(r[1]);
    setMonth(startOfMonth(isSameMonthPair(r[0], r[1]) ? subMonths(r[1], 1) : r[0]));
  };

  const download = () => {
    if (!from) return;
    const start = from;
    const end = to ?? from;
    setLoading(true);
    window.setTimeout(() => {
      onDownload?.(start, end, fmt);
      setLoading(false);
      setOpen(false);
      toast.success(t('done'), {
        description: `${formatRange(start, end)} · ${scopeLabel} · ${fmt === 'xlsx' ? 'Excel' : 'PDF'}`
      });
    }, 1200);
  };

  const activePreset = useMemo(() => {
    const hit = presets.find((p) => {
      const [a, b] = p.range();
      return from && to && isSameDay(a, from) && isSameDay(b, to);
    });
    return hit ? td(hit.key) : undefined;
  }, [from, to, td]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-sm font-medium text-ink transition-colors duration-150 ${
        open ? 'border-ink/40 bg-canvas' : 'border-line bg-surface hover:bg-canvas'}`
        }>
        
        <DownloadIcon className="h-4 w-4" aria-hidden />
        {label ?? t('label')}
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          role="dialog"
          aria-label={t('dialogAria')}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-1.5 w-[calc(100vw-2rem)] max-w-[740px] origin-top-right overflow-hidden rounded-xl border border-line bg-surface shadow-xl sm:w-max">
          
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-ink">{t('title')}</div>
                <div className="text-xs text-muted">{t('subtitle', { scope: scopeLabel })}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row">
              <ul className="flex gap-1 overflow-x-auto border-b border-line p-2 sm:w-40 sm:flex-col sm:border-b-0 sm:border-r">
                {presets.map((p) => {
              const text = td(p.key);
              return (
              <li key={p.key}>
                    <button
                  onClick={() => applyPreset(p.range())}
                  className={`w-full whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors duration-150 ${
                  activePreset === text ? 'bg-brand-soft font-semibold text-ink' : 'text-body hover:bg-canvas'}`
                  }>
                  
                      {text}
                    </button>
                  </li>
              );
              })}
              </ul>

              <div className="flex justify-center gap-6 p-4">
                <Calendar
                month={month}
                rangeStart={from}
                rangeEnd={to}
                hovered={hovered}
                maxDate={TODAY}
                onSelect={selectDay}
                onHover={setHovered}
                onPrev={() => setMonth((m) => addMonths(m, -1))}
                onNext={() => setMonth((m) => addMonths(m, 1))} />
              
                <div className="hidden md:block">
                  <Calendar
                  month={addMonths(month, 1)}
                  rangeStart={from}
                  rangeEnd={to}
                  hovered={hovered}
                  maxDate={TODAY}
                  onSelect={selectDay}
                  onHover={setHovered} />
                
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-line bg-surface-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg border border-line bg-surface p-0.5" role="radiogroup" aria-label={t('formatAria')}>
                  {formatOptions.filter((o) => formats.includes(o.key)).map(({ key, label: fmtLabel, icon: Icon }) =>
                <button
                  key={key}
                  role="radio"
                  aria-checked={fmt === key}
                  onClick={() => setFmt(key)}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors duration-150 ${
                  fmt === key ? 'bg-brand-soft text-ink' : 'text-muted hover:text-ink'}`
                  }>
                  
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {fmtLabel}
                    </button>
                )}
                </div>
                <span className="text-xs tabular-nums text-muted">
                  {from ?
                <>
                      <span className="font-semibold text-ink">{formatRange(from, to)}</span> · {dates.formatDays(rangeLength(from, to))}
                    </> :

                t('pickStart')
                }
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setOpen(false)} disabled={loading} variant="neutral" size="sm" className="font-semibold">
                  {tc('cancel')}
                </Button>
                <Button
                onClick={download}
                disabled={!from || loading}
                variant="brand"
                size="sm"
                className="min-w-[124px] font-semibold"
                icon={loading ?
                <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> :

                <DownloadIcon className="h-4 w-4" aria-hidden />
                }>
                  
                  {loading ? t('generating') : t('download')}
                </Button>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}

function isSameMonthPair(a: Date, b: Date) {
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
