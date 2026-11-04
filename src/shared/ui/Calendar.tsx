'use client';
import React from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek } from
'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { TODAY, formatMonthYear, monthNames, weekdayShortNames } from '@/shared/utils/date';
import { useDateFmt } from '@/shared/i18n/format';
import { useTranslations } from 'next-intl';

interface CalendarProps {
  month: Date;
  selected?: Date | null;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  hovered?: Date | null;
  maxDate?: Date;
  onSelect: (day: Date) => void;
  onHover?: (day: Date | null) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onTitleClick?: () => void;
}

export function Calendar({
  month,
  selected,
  rangeStart,
  rangeEnd,
  hovered,
  maxDate,
  onSelect,
  onHover,
  onPrev,
  onNext,
  onTitleClick
}: CalendarProps) {
  const t = useTranslations('ui');
  useDateFmt(); // re-render when the language changes
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  });

  // Effective range (preview while hovering the second date)
  let from = rangeStart ?? null;
  let to = rangeEnd ?? (rangeStart && hovered ? hovered : null);
  if (from && to && isBefore(to, from)) [from, to] = [to, from];
  const hasSpan = !!(from && to && !isSameDay(from, to));

  const navBtn =
  'flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink';

  return (
    <div className="w-[252px]" onMouseLeave={() => onHover?.(null)}>
      <div className="mb-2 flex h-7 items-center justify-between">
        {onPrev ?
        <button onClick={onPrev} className={navBtn} aria-label={t('prevMonth')}>
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          </button> :

        <span className="w-7" />
        }
        {onTitleClick ?
        <button
          type="button"
          onClick={onTitleClick}
          className="rounded-md px-2 py-0.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
          title={t('pickYear')}>
          
            {formatMonthYear(month)}
          </button> :

        <span className="text-sm font-semibold text-ink">
            {formatMonthYear(month)}
          </span>
        }
        {onNext ?
        <button onClick={onNext} className={navBtn} aria-label={t('nextMonth')}>
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </button> :

        <span className="w-7" />
        }
      </div>

      <div className="grid grid-cols-7">
        {weekdayShortNames().map((w) =>
        <div key={w} className="flex h-8 items-center justify-center text-[11px] font-medium text-subtle">
            {w}
          </div>
        )}
        {days.map((day, idx) => {
          if (!isSameMonth(day, month)) return <div key={day.toISOString()} className="h-9" />;

          const disabled = !!maxDate && isAfter(day, maxDate);
          const isStart = !!from && isSameDay(day, from);
          const isEnd = !!to && isSameDay(day, to);
          const isMiddle = hasSpan && !!from && !!to && isAfter(day, from) && isBefore(day, to);
          const isSelected = selected && isSameDay(day, selected) || isStart || isEnd;
          const isToday = isSameDay(day, TODAY);
          const col = idx % 7;

          const band = hasSpan && (isMiddle || isStart || isEnd) ?
          [
          'bg-brand-soft',
          isStart || col === 0 ? 'rounded-l-md' : '',
          isEnd || col === 6 ? 'rounded-r-md' : ''].
          join(' ') :
          '';

          return (
            <div key={day.toISOString()} className={`h-9 py-0.5 ${band}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                onMouseEnter={() => onHover?.(day)}
                aria-pressed={!!isSelected}
                aria-label={`${day.getDate()} ${monthNames()[day.getMonth()]}`}
                className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-md text-[13px] tabular-nums transition-colors duration-100 ${
                isSelected ?
                'bg-brand font-semibold text-on-brand' :
                disabled ?
                'cursor-not-allowed text-subtle/50' :
                isMiddle ?
                'text-ink hover:bg-surface' :
                'text-body hover:bg-canvas'}`
                }>
                
                {day.getDate()}
                {isToday && !isSelected &&
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-ink" aria-hidden />
                }
              </button>
            </div>);

        })}
      </div>
    </div>);

}
