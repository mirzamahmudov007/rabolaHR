'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, CrownIcon, XIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { SelectMenu } from '@/shared/form/SelectMenu';
import { Toggle } from '@/shared/form/Toggle';
import { useGloss } from '@/shared/i18n/format';
import { PermissionMatrix } from '@/features/admins/components/PermissionMatrix';
import { ROLE_KEYS } from '@/features/admins/types';
import type { Admin, AdminRoleKey, PermissionId } from '@/features/admins/types';

interface AddAdminModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (admin: Admin) => void;
  /** Emails already registered — blocks duplicates. */
  takenEmails: string[];
}

const ease = [0.23, 1, 0.32, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddAdminModal({ open, onClose, onCreate, takenEmails }: AddAdminModalProps) {
  const t = useTranslations('adminPage');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [tried, setTried] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleKey, setRoleKey] = useState<AdminRoleKey | null>(null);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [perms, setPerms] = useState<PermissionId[]>([]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setStep(1);setTried(false);setName('');setEmail('');
    setRoleKey(null);setSuperAdmin(false);setPerms([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const nameOk = name.trim().length > 0;
  const emailFormatOk = EMAIL_RE.test(email.trim());
  const emailTaken = emailFormatOk && takenEmails.includes(email.trim().toLowerCase());
  const emailOk = emailFormatOk && !emailTaken;
  const roleOk = Boolean(roleKey);
  const step1Valid = nameOk && emailOk && roleOk;
  const step2Valid = superAdmin || perms.length > 0;

  const goNext = () => {
    setTried(true);
    if (!step1Valid) return;
    setTried(false);
    setStep(2);
  };

  const save = () => {
    if (!step1Valid) {setStep(1);setTried(true);return;}
    if (!step2Valid) {setTried(true);return;}
    onCreate({
      id: `ad-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      roleKey: roleKey!,
      super: superAdmin,
      permissions: superAdmin ? [] : [...perms]
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
          aria-labelledby="add-admin-title"
          className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-surface shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
              <div>
                <h2 id="add-admin-title" className="text-lg font-semibold tracking-tight text-ink">{t('modalTitle')}</h2>
                <p className="mt-0.5 text-[13px] text-muted">{t('modalDesc')}</p>
              </div>
              <IconButton icon={<XIcon className="h-5 w-5" />} label={tc('close')} onClick={onClose} />
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 border-b border-line px-6 py-3">
              {[t('step1'), t('step2')].map((label, i) => {
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
                  <Field label={t('nameLabel')} required error={tried && !nameOk ? t('errName') : undefined}>
                    <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePh')}
                    aria-label={t('nameLabel')} />

                  </Field>
                  <Field
                  label={t('emailLabel')}
                  required
                  error={tried && !emailFormatOk ? t('errEmail') : tried && emailTaken ? t('emailTaken') : undefined}>
                  
                    <TextInput
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPh')}
                    aria-label={t('emailLabel')}
                    inputMode="email" />

                  </Field>
                  <Field label={t('roleLabel')} required error={tried && !roleOk ? t('errRole') : undefined}>
                    <SelectMenu
                    value={roleKey}
                    options={ROLE_KEYS.map((r) => ({ value: r, label: t(`role.${r}`) }))}
                    onChange={(v) => setRoleKey(v as AdminRoleKey | null)}
                    placeholder={t('rolePh')} />

                  </Field>
                  <Toggle
                  checked={superAdmin}
                  onChange={setSuperAdmin}
                  label={t('superLabel')}
                  description={t('superDesc')} />

                </div>
              }

              {step === 2 &&
              <div className="space-y-4">
                  {superAdmin &&
                <p className="flex items-center gap-2 rounded-lg border border-line bg-canvas/60 px-3.5 py-2.5 text-[13px] text-body">
                      <CrownIcon className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                      {t('superDesc')}
                    </p>
                }
                  <PermissionMatrix selected={perms} onChange={setPerms} fullAccess={superAdmin} />
                  {tried && !step2Valid &&
                <p className="text-xs font-medium text-absent-ink">{t('errPerms')}</p>
                }
                </div>
              }
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)} disabled={step === 1}>
                {t('back')}
              </Button>
              {step === 1 ?
              <Button variant="brand" size="lg" onClick={goNext}>
                  {t('next')}
                </Button> :

              <Button variant="brand" size="lg" onClick={save}>
                  {t('save')}
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
