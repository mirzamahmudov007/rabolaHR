'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { StatusPill, kindIcon } from '@/features/devices/components/StatusPill';
import { useGloss } from '@/shared/i18n/format';
import type { Device } from '@/features/devices/types';

interface DeviceRowProps {
  device: Device;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function DeviceRow({ device, selected, onSelect }: DeviceRowProps) {
  const t = useTranslations('devices');
  const { g } = useGloss();
  const Icon = kindIcon[device.kind];
  const ago =
  device.lastSeenMinutes === null ?
  t('status.' + device.status) :
  device.lastSeenMinutes < 60 ?
  t('agoMinutes', { count: device.lastSeenMinutes }) :
  t('agoHours', { count: Math.round(device.lastSeenMinutes / 60) });

  return (
    <button
      type="button"
      onClick={() => onSelect(device.id)}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors duration-150 last:border-b-0 ${
      selected ? 'bg-brand-soft' : 'hover:bg-canvas'}`
      }>
      
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{g(device.name)}</span>
        <span className="mt-0.5 block truncate text-xs text-muted">
          {g(device.branch)} · {t(`direction.${device.direction}`)}
        </span>
      </span>
      <span className="hidden shrink-0 text-right text-xs tabular-nums text-muted sm:block">
        {device.eventsToday > 0 ? t('eventsToday', { count: device.eventsToday }) : t('noEvents')}
        <span className="mt-0.5 block text-subtle">{device.lastSeenMinutes === null ? '—' : ago}</span>
      </span>
      <StatusPill status={device.status} />
    </button>);

}
