'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { BellIcon, CctvIcon, FingerprintIcon } from 'lucide-react';
import type { DeviceKind, DeviceStatus } from '@/features/devices/types';

export const statusMeta: Record<DeviceStatus, {dot: string;text: string;soft: string;}> = {
online: { dot: 'bg-present', text: 'text-present-ink', soft: 'bg-present-soft' },
offline: { dot: 'bg-subtle', text: 'text-muted', soft: 'bg-canvas' },
pending: { dot: 'bg-late', text: 'text-late-ink', soft: 'bg-late-soft' },
error: { dot: 'bg-absent', text: 'text-absent-ink', soft: 'bg-absent-soft' }
};

export const kindIcon: Record<DeviceKind, typeof FingerprintIcon> = {
  terminal: FingerprintIcon,
  camera: CctvIcon,
  doorbell: BellIcon
};

export function StatusPill({ status }: { status: DeviceStatus }) {
  const t = useTranslations('devices');
  const m = statusMeta[status];
  const Icon = status === 'error' ? BellIcon : null;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${m.soft} ${m.text}`}>
      {Icon ? <Icon className="h-3 w-3" aria-hidden /> :
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} aria-hidden />
      }
      {t(`status.${status}`)}
    </span>);

}
