'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { SelectMenu } from '@/shared/form/SelectMenu';
import { Toggle } from '@/shared/form/Toggle';
import { PermissionMatrix } from '@/features/admins/components/PermissionMatrix';
import { ROLE_KEYS } from '@/features/admins/types';
import type { Admin, AdminRoleKey, PermissionId } from '@/features/admins/types';

interface EditAdminModalProps {
  open: boolean;
  onClose: () => void;
  admin: Admin | null;
  onSave: (admin: Admin) => void;
  /** Emails of the other admins — the current one is excluded. */
  takenEmails: string[];
}

const ease = [0.23, 1, 0.32, 1] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditAdminModal({ open, onClose, admin, onSave, takenEmails }: EditAdminModalProps) {
  const t = useTranslations('adminPage');
  const tc = useTranslations('common');
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleKey, setRoleKey] = useState<AdminRoleKey | null>(null);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [perms, setPerms] = useState<PermissionId[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !admin) return;
    setTried(false);setSaving(false);
    setName(admin.name);setEmail(admin.email);setRoleKey(admin.roleKey);
    setSuperAdmin(admin.super);setPerms([...admin.permissions]);
  }, [open, admin]);

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
  const permsOk = superAdmin || perms.length > 0;
  const valid = nameOk && emailOk && roleOk && permsOk;

  const save = () => {
    if (!admin || !valid) {setTried(true);return;}
    setSaving(true);
    // Short delay so the button state is visible, like a real PUT round-trip.
    window.setTimeout(() => {
      onSave({
        ...admin,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        roleKey: roleKey!,
        super: superAdmin,
        permissions: superAdmin ? [] : [...perms]
      });
      setSaving(false);
    }, 700);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && admin &&
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
          aria-labelledby="edit-admin-title"
          className="relative flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-surface shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
              <div>
                <h2 id="edit-admin-title" className="text-lg font-semibold tracking-tight text-ink">{t('editAdmin')}</h2>
                <p className="mt-0.5 text-[13px] text-muted">{t('modalDesc')}</p>
              </div>
              <IconButton icon={<XIcon className="h-5 w-5" />} label={tc('close')} onClick={onClose} />
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('nameLabel')} required error={tried && !nameOk ? t('errName') : undefined}>
                  <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label={t('nameLabel')} />

                </Field>
                <Field
                label={t('emailLabel')}
                required
                error={tried && !emailFormatOk ? t('errEmail') : tried && emailTaken ? t('emailTaken') : undefined}>

                  <TextInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label={t('emailLabel')}
                  inputMode="email" />

                </Field>
              </div>
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

              <PermissionMatrix selected={perms} onChange={setPerms} fullAccess={superAdmin} />
              {tried && !permsOk &&
              <p className="text-xs font-medium text-absent-ink">{t('errPerms')}</p>}
            </div>

            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <Button variant="ghost" size="lg" onClick={onClose} disabled={saving}>
                {tc('cancel')}
              </Button>
              <Button variant="brand" size="lg" onClick={save} disabled={saving}>
                {saving ? tc('saving') : t('saveEdit')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}
