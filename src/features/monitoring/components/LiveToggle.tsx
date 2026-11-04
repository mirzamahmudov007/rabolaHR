'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { PauseIcon, PlayIcon } from 'lucide-react';

interface LiveToggleProps {
  live: boolean;
  onToggle: () => void;
}

/** Live/paused pill with a pulsing status dot and play/pause icon. */
export function LiveToggle({ live, onToggle }: LiveToggleProps) {
  const tm = useTranslations('monitoring');
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={live}
      className="mb-2.5 inline-flex h-8 items-center gap-2 rounded-lg border border-line px-3 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-canvas">
      
      {live ?
      <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-present opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-present" />
        </span> :

      <span className="h-2 w-2 rounded-full bg-subtle" />
      }
      {live ? tm('live') : tm('paused')}
      {live ? <PauseIcon className="h-3.5 w-3.5 text-muted" aria-hidden /> : <PlayIcon className="h-3.5 w-3.5 text-muted" aria-hidden />}
    </button>);

}
