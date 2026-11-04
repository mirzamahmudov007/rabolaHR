'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2Icon, MonitorCheckIcon, Trash2Icon } from 'lucide-react';
import { StatusPill, kindIcon, statusMeta } from '@/features/devices/components/StatusPill';
import { SettingsPanel } from '@/features/devices/components/SettingsPanel';
import { Button } from '@/shared/ui/Button';
import { Tabs } from '@/shared/ui/Tabs';
import { useGloss } from '@/shared/i18n/format';
import type { Device, DeviceSettings } from '@/features/devices/types';

interface DeviceDetailProps {
  device: Device | null;
  onRemove: (id: string) => void;
  onUpdate: (device: Device) => void;
}

export function DeviceDetail({ device, onRemove, onUpdate }: DeviceDetailProps) {
  const t = useTranslations('devices');
  const ta = useTranslations('devices.actions');
  const td = useTranslations('devices.detail');
  const ts = useTranslations('devices.settings');
  const tac = useTranslations('devices.activity');
  const tt = useTranslations('devices.toast');
  const { g } = useGloss();
  const [tab, setTab] = useState<'info' | 'settings'>('info');
  const [testing, setTesting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    setConfirming(false);
    setTab('info');
  }, [device?.id]);

  if (!device) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface p-10 text-center shadow-card">
        <h2 className="text-sm font-semibold text-ink">{td('pickTitle')}</h2>
        <p className="text-[13px] text-muted">{td('pickDesc')}</p>
      </div>);

  }

  const Icon = kindIcon[device.kind];
  const m = statusMeta[device.status];
  const rows: [string, React.ReactNode][] = [
  [td('model'), device.model],
  [td('serial'), <span key="sn" className="tabular-nums">{device.serial}</span>],
  [td('kindLabel'), t(`kind.${device.kind}`)],
  [td('directionLabel'), t(`direction.${device.direction}`)],
  [td('branchLabel'), g(device.branch)],
  [td('modeLabel'), t(`mode.${device.mode}`)],
  [td('address'), device.mode === 'direct' ? device.host ?? '—' : td('autoChannel')],
  [td('firmware'), device.firmware],
  [
  td('lastSeen'),
  device.lastSeenMinutes === null ?
  t('status.' + device.status) :
  device.lastSeenMinutes < 60 ?
  t('agoMinutes', { count: device.lastSeenMinutes }) :
  t('agoHours', { count: Math.round(device.lastSeenMinutes / 60) })
  ],
  [
  td('pushState'),
  <span key="push" className={device.pushEnabled ? 'text-present-ink' : 'text-muted'}>
      {device.pushEnabled ? td('pushOn') : td('pushOff')}
    </span>
  ]];


  const runTest = () => {
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      if (device.status === 'online') {
        toast.success(tt('testOk'), {
          description: tt('testOkDesc', { model: device.model, ms: 18 + Math.floor(Math.random() * 40) })
        });
      } else {
        toast.error(tt('testFail'), { description: tt('testFailDesc') });
      }
    }, 900);
  };

  const askRemove = () => {
    if (confirming) {
      onRemove(device.id);
      return;
    }
    setConfirming(true);
    timer.current = window.setTimeout(() => setConfirming(false), 4000);
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-5 shadow-card" aria-label={td('aria')}>
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${m.soft} ${m.text}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold tracking-tight text-ink">{g(device.name)}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{g(device.branch)}</p>
        </div>
        <StatusPill status={device.status} />
      </div>

      <div className="mt-3 border-b border-line">
        <Tabs
          label={td('aria')}
          value={tab}
          onChange={(k) => setTab(k as 'info' | 'settings')}
          items={[
          { key: 'info', label: ts('tabInfo') },
          { key: 'settings', label: ts('tabSettings') }]
          } />

      </div>

      {tab === 'info' ?
      <div>
          {(device.status === 'pending' || device.status === 'error') &&
        <div className="mt-4 rounded-lg bg-late-soft px-3.5 py-3">
              <p className="text-[13px] font-semibold text-late-ink">{t('status.' + device.status)}</p>
              <p className="mt-1 text-xs leading-relaxed text-body">{device.status === 'pending' ? td('pendingNote') : td('errorNote')}</p>
            </div>
        }

          <dl className="mt-2 divide-y divide-line">
            {rows.map(([label, value]) =>
          <div key={label} className="flex items-baseline justify-between gap-3 py-2 text-[13px]">
                <dt className="shrink-0 text-muted">{label}</dt>
                <dd className="min-w-0 truncate text-right font-medium text-ink">{value}</dd>
              </div>
          )}
          </dl>

          {device.recent && device.recent.length > 0 &&
        <div className="mt-4">
              <p className="text-xs font-semibold text-ink">{tac('title')}</p>
              <ul className="mt-1.5 divide-y divide-line">
                {device.recent.map((r) =>
            <li
              key={`${r.name}-${r.minutesAgo}`}
              className="flex items-baseline justify-between gap-3 py-1.5 text-[13px]">
              
                    <span className="min-w-0 truncate text-body">{g(r.name)}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      <span className={r.direction === 'in' ? 'font-medium text-present-ink' : 'font-medium text-late-ink'}>
                        {t(`direction.${r.direction}`)}
                      </span>
                      {' · '}
                      {r.minutesAgo < 60 ?
                t('agoMinutes', { count: r.minutesAgo }) :
                t('agoHours', { count: Math.round(r.minutesAgo / 60) })}
                    </span>
                  </li>
            )}
              </ul>
            </div>
        }

          <div className="mt-4 flex items-center gap-2">
            <Button
            variant="secondary"
            size="md"
            onClick={runTest}
            disabled={testing}
            icon={testing ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : <MonitorCheckIcon className="h-4 w-4" aria-hidden />}>
            
            {testing ? ta('testing') : ta('test')}
            </Button>
            <Button
            variant={confirming ? 'danger' : 'ghost'}
            size="md"
            onClick={askRemove}
            className={confirming ? 'font-semibold' : ''}
            icon={<Trash2Icon className="h-4 w-4" aria-hidden />}>
            
            {confirming ? ta('confirmRemove') : ta('remove')}
            </Button>
          </div>
        </div> :

      <div className="pt-4">
          <SettingsPanel
          device={device}
          onSaved={(settings: DeviceSettings) => onUpdate({ ...device, settings })} />
          
        </div>
      }
    </div>);

}
