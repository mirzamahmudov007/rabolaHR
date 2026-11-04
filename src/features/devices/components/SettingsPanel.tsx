'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/form/Field';
import { Segmented } from '@/shared/form/Segmented';
import { Toggle } from '@/shared/form/Toggle';
import { useGloss } from '@/shared/i18n/format';
import { DEFAULT_SETTINGS } from '@/features/devices/data/devices';
import type { Device, DeviceAuthMode, DeviceSettings } from '@/features/devices/types';

interface SettingsPanelProps {
  device: Device;
  onSaved: (settings: DeviceSettings) => void;
}

const authModes: DeviceAuthMode[] = ['face', 'card', 'faceCard', 'faceOrCard'];

function SliderRow({ label, hint, display, value, min, max, step, onChange }: {
  label: string;
  hint?: string;
  display: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer accent-brand" />

        <span className="w-20 shrink-0 text-right text-[13px] font-semibold tabular-nums text-ink">{display}</span>
      </div>
    </Field>);

}

export function SettingsPanel({ device, onSaved }: SettingsPanelProps) {
  const ts = useTranslations('devices.settings');
  const tt = useTranslations('devices.toast');
  const { g } = useGloss();
  const [draft, setDraft] = useState<DeviceSettings>(device.settings ?? DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(device.settings ?? DEFAULT_SETTINGS);
    setSaving(false);
  }, [device]);

  const online = device.status === 'online';
  const set = (patch: Partial<DeviceSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    setSaving(true);
    // Real flow: backend PUTs the parameters to the device (ISAPI over
    // direct or ISUP tunnel); offline devices simply do not answer.
    window.setTimeout(() => {
      setSaving(false);
      if (online) {
        onSaved(draft);
        toast.success(tt('settingsSaved'), { description: tt('settingsSavedDesc', { name: g(device.name) }) });
      } else {
        toast.error(tt('settingsFail'), { description: tt('settingsFailDesc') });
      }
    }, 900);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{ts('grpRecognition')}</p>

      <Field label={ts('authMode')}>
        <Segmented
          value={draft.authMode}
          onChange={(v) => set({ authMode: v })}
          label={ts('authMode')}
          options={authModes.map((m) => ({ value: m, label: ts(`auth.${m}`) }))} />

      </Field>
      {device.kind !== 'camera' &&
      <Toggle
        checked={draft.reminder ?? false}
        onChange={(reminder) => set({ reminder })}
        label={ts('reminder')}
        description={draft.reminder ? ts('reminderDescOn') : ts('reminderDescOff')} />

      }
      <SliderRow
        label={ts('distance')}
        hint={ts('distanceHint')}
        display={ts('distanceValue', { value: draft.distance })}
        value={draft.distance}
        min={1}
        max={10}
        step={1}
        onChange={(distance) => set({ distance })} />
        
      <SliderRow
        label={ts('threshold')}
        hint={ts('thresholdHint')}
        display={ts('thresholdValue', { value: draft.threshold })}
        value={draft.threshold}
        min={60}
        max={99}
        step={1}
        onChange={(threshold) => set({ threshold })} />
        
      <SliderRow
        label={ts('timeout')}
        hint={ts('timeoutHint')}
        display={ts('timeoutValue', { value: draft.timeoutSec })}
        value={draft.timeoutSec}
        min={3}
        max={30}
        step={1}
        onChange={(timeoutSec) => set({ timeoutSec })} />
        
      <SliderRow
        label={ts('capacity')}
        display={ts('capacityValue', { value: draft.capacity })}
        value={draft.capacity}
        min={50}
        max={6000}
        step={50}
        onChange={(capacity) => set({ capacity })} />
        

      <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-subtle">{ts('grpDevice')}</p>

      <SliderRow
        label={ts('volume')}
        display={String(draft.volume)}
        value={draft.volume}
        min={0}
        max={10}
        step={1}
        onChange={(volume) => set({ volume })} />
        
      <SliderRow
        label={ts('brightness')}
        display={`${draft.brightness}%`}
        value={draft.brightness}
        min={0}
        max={100}
        step={5}
        onChange={(brightness) => set({ brightness })} />
        
      {device.settings?.doorOpenSec !== undefined &&
      <SliderRow
        label={ts('doorOpen')}
        hint={ts('doorOpenHint')}
        display={ts('timeoutValue', { value: draft.doorOpenSec ?? 0 })}
        value={draft.doorOpenSec ?? 0}
        min={0}
        max={60}
        step={1}
        onChange={(doorOpenSec) => set({ doorOpenSec })} />

      }

      {!online &&
      <p className="rounded-lg bg-late-soft px-3.5 py-2.5 text-xs leading-relaxed text-body">{ts('offlineNote')}</p>
      }

      <Button
        variant="brand"
        size="md"
        onClick={save}
        disabled={saving}
        className="w-full"
        icon={saving ? <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden /> : undefined}>
        
        {saving ? ts('saving') : ts('save')}
      </Button>
    </div>);

}
