'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  SparklesIcon,
  XIcon } from
'lucide-react';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { OptionCard } from '@/shared/form/OptionCard';
import { Segmented } from '@/shared/form/Segmented';
import { SelectMenu } from '@/shared/form/SelectMenu';
import { branches } from '@/shared/data/branches';
import { useGloss } from '@/shared/i18n/format';
import { kindIcon } from '@/features/devices/components/StatusPill';
import { DEFAULT_SETTINGS } from '@/features/devices/data/devices';
import type { Device, DeviceDirection, DeviceKind } from '@/features/devices/types';

interface AddDeviceWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (device: Device) => void;
  /** Device IDs already registered — blocks duplicates. */
  takenSns: string[];
}

const ease = [0.23, 1, 0.32, 1] as const;

const kindModel: Record<DeviceKind, string> = {
  terminal: 'DS-K1T341M',
  camera: 'DS-2CD2685F',
  doorbell: 'DS-K1T671M'
};

export function AddDeviceWizard({ open, onClose, onCreate, takenSns }: AddDeviceWizardProps) {
  const t = useTranslations('devices');
  const tw = useTranslations('devices.wizard');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [tried, setTried] = useState(false);
  const [name, setName] = useState('');
  const [branch, setBranch] = useState<string | null>(null);
  const [kind, setKind] = useState<DeviceKind>('terminal');
  const [direction, setDirection] = useState<DeviceDirection>('in');
  const [devSn, setDevSn] = useState('');

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setStep(1);setTried(false);setName('');setBranch(null);setKind('terminal');
    setDirection('in');setDevSn('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const branchOpts = branches.map((b) => ({ value: b.name, label: g(b.name), group: g(b.region) }));
  const kindList: DeviceKind[] = ['terminal', 'camera', 'doorbell'];

  const nameOk = name.trim().length > 0;
  const branchOk = Boolean(branch);
  const devSnOk = devSn.trim().length > 0;
  const snTaken = devSnOk && takenSns.includes(devSn.trim().toUpperCase());

  const step1Valid = nameOk && branchOk;
  const step2Valid = devSnOk && !snTaken;

  const goNext = () => {
    setTried(true);
    if (step === 1 && !step1Valid) return;
    setTried(false);
    setStep(2);
  };

  const save = () => {
    if (!step1Valid) {setStep(1);setTried(true);return;}
    if (!step2Valid) {setTried(true);return;}
    // The camera dials our server itself — it is saved as pending and flips
    // to online the moment it first reaches us (simulated in Devices).
    onCreate({
      id: `dv-${Date.now()}`,
      name: name.trim(),
      branch: branch!,
      kind,
      direction,
      model: kindModel[kind],
      serial: devSn.trim().toUpperCase(),
      mode: 'isup',
      status: 'pending',
      firmware: '—',
      lastSeenMinutes: null,
      eventsToday: 0,
      pushEnabled: false,
      settings: { ...DEFAULT_SETTINGS }
    });
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease }}>
        
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="device-wizard-title"
          className="relative flex max-h-[88vh] w-full max-w-xl flex-col rounded-2xl border border-line bg-surface shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
              <div>
                <h2 id="device-wizard-title" className="text-lg font-semibold tracking-tight text-ink">
                  {tw('title')}
                </h2>
                <p className="mt-0.5 text-[13px] text-muted">{tw('subtitle')}</p>
              </div>
              <IconButton icon={<XIcon className="h-5 w-5" />} label={tc('close')} onClick={onClose} />
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 border-b border-line px-6 py-3">
              {[tw('step1'), tw('step2')].map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                  <React.Fragment key={label}>
                      {i > 0 && <span className="h-px w-6 bg-line" aria-hidden />}
                      <span
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-150 ${
                      done ? 'text-present-ink' : active ? 'bg-brand-soft text-ink' : 'text-subtle'}`
                    }>
                      
                        {done ? <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden /> :
                    <span className="tabular-nums">{n}</span>
                    }
                        {label}
                      </span>
                  </React.Fragment>);

              })}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {step === 1 &&
              <div className="space-y-4">
                  <Field label={tw('nameLabel')} required error={tried && !nameOk ? tw('errName') : undefined}>
                    <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tw('namePh')}
                    aria-label={tw('nameLabel')} />

                  </Field>
                  <Field label={tw('branchLabel')} required error={tried && !branchOk ? tw('errBranch') : undefined}>
                    <SelectMenu
                    value={branch}
                    options={branchOpts}
                    onChange={setBranch}
                    placeholder={tw('branchPh')}
                    searchPlaceholder={tc('search')} />

                  </Field>
                  <div role="radiogroup" aria-label={tw('kindLabel')} className="grid gap-2 sm:grid-cols-3">
                    {kindList.map((k) => {
                    const Icon = kindIcon[k];
                    return (
                      <OptionCard
                      key={k}
                      selected={kind === k}
                      onSelect={() => setKind(k)}
                      title={t(`kind.${k}`)}
                      description={kindModel[k]}
                      icon={<Icon className="h-4 w-4" aria-hidden />} />);

                  })}
                  </div>
                  <Field label={tw('directionChoice')} hint={direction === 'both' ? tw('bothModeNote') : undefined}>
                    <Segmented
                      value={direction}
                      onChange={setDirection}
                      label={tw('directionChoice')}
                      options={(['in', 'out', 'both'] as DeviceDirection[]).map((d) => ({ value: d, label: t(`direction.${d}`) }))} />

                    
                  </Field>
                </div>
              }

              {step === 2 &&
              <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{tw('snTitle')}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{tw('snDesc')}</p>
                  </div>
                  <Field
                label={tw('snLabel')}
                required
                hint={tw('devIdHint')}
                error={tried && !devSnOk ? tw('errSn') : tried && snTaken ? tw('snTaken') : undefined}>
                
                    <TextInput
                  value={devSn}
                  onChange={(e) => setDevSn(e.target.value)}
                  placeholder={tw('devIdPh')}
                  aria-label={tw('snLabel')}
                  className="font-mono" />

                </Field>
                  <div className="rounded-lg border border-line bg-canvas/60 p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <SparklesIcon className="h-4 w-4 text-brand" aria-hidden />
                      {tw('autoTitle')}
                    </p>
                    <ol className="list-decimal space-y-1.5 pl-4 text-[13px] leading-relaxed text-body">
                      <li>{tw('auto1')}</li>
                      <li>{tw('auto2')}</li>
                      <li>{tw('auto3')}</li>
                    </ol>
                  </div>
                </div>
              }
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)} disabled={step === 1}>
                {tw('back')}
              </Button>
              {step === 1 ?
              <Button variant="brand" size="lg" onClick={goNext}>
                  {tw('next')}
                </Button> :

              <Button variant="brand" size="lg" onClick={save}>
                  {tw('save')}
                </Button>
              }
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}
