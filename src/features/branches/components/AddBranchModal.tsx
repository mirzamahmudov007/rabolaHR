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
import { useGloss } from '@/shared/i18n/format';
import type { Branch } from '@/shared/types/employee';

interface AddBranchModalProps {
  open: boolean;
  onClose: () => void;
  regions: string[];
  onCreate: (branch: Branch) => void;
}

const ease = [0.23, 1, 0.32, 1] as const;

export function AddBranchModal({ open, onClose, regions, onCreate }: AddBranchModalProps) {
  const t = useTranslations('branchPage');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [mounted, setMounted] = useState(false);
  const [tried, setTried] = useState(false);
  const [name, setName] = useState('');
  const [region, setRegion] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setTried(false);setName('');setRegion(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const nameOk = name.trim().length > 0;
  const regionOk = Boolean(region);

  const save = () => {
    if (!nameOk || !regionOk) {setTried(true);return;}
    onCreate({ id: `br-${Date.now()}`, name: name.trim(), region: region! });
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
          aria-labelledby="add-branch-title"
          className="relative w-full max-w-md rounded-2xl border border-line bg-surface shadow-2xl"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease }}>
          
            <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
              <div>
                <h2 id="add-branch-title" className="text-lg font-semibold tracking-tight text-ink">{t('modalTitle')}</h2>
                <p className="mt-0.5 text-[13px] text-muted">{t('modalDesc')}</p>
              </div>
              <IconButton icon={<XIcon className="h-5 w-5" />} label={tc('close')} onClick={onClose} />
            </div>

            <div className="space-y-4 px-6 py-5">
              <Field label={t('nameLabel')} required error={tried && !nameOk ? t('errName') : undefined}>
                <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePh')}
                aria-label={t('nameLabel')} />

              </Field>
              <Field label={t('regionLabel')} required error={tried && !regionOk ? t('errRegion') : undefined}>
                <SelectMenu
                value={region}
                options={regions.map((r) => ({ value: r, label: g(r) }))}
                onChange={setRegion}
                placeholder={t('regionPh')}
                searchPlaceholder={tc('search')} />

              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
              <Button variant="ghost" size="lg" onClick={onClose}>
                {tc('cancel')}
              </Button>
              <Button variant="brand" size="lg" onClick={save}>
                {t('save')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>,
    document.body
  );
}
