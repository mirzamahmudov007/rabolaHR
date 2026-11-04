'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CctvIcon, SearchIcon } from 'lucide-react';
import { devices as seedDevices } from '@/features/devices/data/devices';
import { DeviceRow } from '@/features/devices/components/DeviceRow';
import { DeviceDetail } from '@/features/devices/components/DeviceDetail';
import { AddDeviceWizard } from '@/features/devices/components/AddDeviceWizard';
import { BranchSwitcher } from '@/shared/components/BranchSwitcher';
import { Button } from '@/shared/ui/Button';
import { Tabs } from '@/shared/ui/Tabs';
import { TextInput } from '@/shared/form/TextInput';
import { branches } from '@/shared/data/branches';
import { useGloss } from '@/shared/i18n/format';
import type { Device, DeviceStatus } from '@/features/devices/types';

const statusOrder: DeviceStatus[] = ['online', 'pending', 'offline', 'error'];

export function Devices() {
  const t = useTranslations('devices');
  const tc = useTranslations('common');
  const tt = useTranslations('devices.toast');
  const { g } = useGloss();
  const [list, setList] = useState<Device[]>(seedDevices);
  const [tab, setTab] = useState<DeviceStatus | 'all'>('all');
  const [branch, setBranch] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(seedDevices[0]?.id ?? null);
  const [wizardOpen, setWizardOpen] = useState(false);
  /** Wizard-added devices awaiting their first call to the server (simulated). */
  const activating = useRef(new Map<string, string>());

  const scoped = useMemo(() => branch ? list.filter((d) => d.branch === branch) : list, [list, branch]);

  const counts = useMemo(() => {
    const c: Record<DeviceStatus, number> = { online: 0, pending: 0, offline: 0, error: 0 };
    scoped.forEach((d) => c[d.status] += 1);
    return c;
  }, [scoped]);

  const branchCounts = useMemo(() => {
    const c: Record<string, number> = {};
    list.forEach((d) => c[d.branch] = (c[d.branch] ?? 0) + 1);
    return c;
  }, [list]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scoped.filter(
      (d) =>
      (tab === 'all' || d.status === tab) && (
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.serial.toLowerCase().includes(q) ||
      d.model.toLowerCase().includes(q) ||
      (d.host ?? '').toLowerCase().includes(q) ||
      g(d.branch).toLowerCase().includes(q)));


  }, [scoped, tab, query, g]);

  const selected = list.find((d) => d.id === selectedId) ?? null;

  const create = (device: Device) => {
    setList((l) => [...l, device]);
    setSelectedId(device.id);
    setWizardOpen(false);
    activating.current.set(device.id, g(device.name));
    toast.success(tt('added'), { description: tt('addedIsup', { name: g(device.name) }) });
  };

  // Demo of the real ISUP flow: the camera dials the server on its own —
  // a few seconds after adding, the pending device flips to online.
  useEffect(() => {
    if (activating.current.size === 0) return;
    const timer = window.setInterval(() => {
      const ready = [...activating.current.keys()];
      if (ready.length === 0) return;
      let flipped = false;
      setList((prev) =>
        prev.map((d) => {
          if (!activating.current.has(d.id)) return d;
          flipped = true;
          return { ...d, status: 'online' as const, lastSeenMinutes: 0, pushEnabled: true, firmware: 'V5.7.8 build 240108' };
        }));

      if (flipped) {
        ready.forEach((id) => {
          const name = activating.current.get(id);
          activating.current.delete(id);
          if (name) toast.success(tt('autoOnline', { name }), { description: tt('autoOnlineDesc') });
        });
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [list, tt]);

  const update = (device: Device) => {
    setList((l) => l.map((d) => (d.id === device.id ? device : d)));
  };

  const remove = (id: string) => {
    activating.current.delete(id);
    const victim = list.find((d) => d.id === id);
    setList((l) => l.filter((d) => d.id !== id));
    setSelectedId((cur) => cur === id ? null : cur);
    if (victim) {
      toast(tt('removed', { name: g(victim.name) }), {
        description: tt('removedDesc', { count: list.length - 1 })
      });
    }
  };

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-xl border border-line bg-surface shadow-card" aria-label={t('listAria')}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-3">
          <Tabs
            label={t('listAria')}
            value={tab}
            onChange={(k) => setTab(k as DeviceStatus | 'all')}
            items={[
              { key: 'all', label: tc('all'), count: scoped.length },
              ...statusOrder.map((s) => ({
                key: s,
                label: t(`status.${s}`),
                count: counts[s],
                alert: s === 'error' && counts[s] > 0
              }))]
            } />

          
          <Button
            variant="brand"
            size="md"
            onClick={() => setWizardOpen(true)}
            icon={<CctvIcon className="h-4 w-4" aria-hidden />}>
            
            {t('add')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 p-4">
          <BranchSwitcher branches={branches} counts={branchCounts} total={list.length} value={branch} onChange={setBranch} />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPh')}
            aria-label={tc('search')}
            className="w-full sm:w-64"
            leading={<SearchIcon className="h-4 w-4" aria-hidden />} />

          
        </div>

        {visible.length > 0 ?
        <div>
            {visible.map((d) =>
          <DeviceRow key={d.id} device={d} selected={d.id === selectedId} onSelect={setSelectedId} />
          )}
          </div> :

        <div className="flex flex-col items-center gap-1.5 px-4 py-14 text-center">
            <p className="text-sm font-semibold text-ink">{t('emptyTitle')}</p>
            <p className="text-[13px] text-muted">{t('emptyDesc')}</p>
          </div>
        }
      </section>

      <div className="xl:sticky xl:top-[88px]">
        <DeviceDetail device={selected} onRemove={remove} onUpdate={update} />
      </div>

      <AddDeviceWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreate={create} takenSns={list.map((d) => d.serial)} />
    </div>);

}
