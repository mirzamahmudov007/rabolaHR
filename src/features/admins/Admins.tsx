'use client';
import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CrownIcon, PencilIcon, SearchIcon, ShieldCheckIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { admins as seedAdmins } from '@/features/admins/data/admins';
import { ALL_PERMISSIONS } from '@/features/admins/types';
import { AddAdminModal } from '@/features/admins/components/AddAdminModal';
import { EditAdminModal } from '@/features/admins/components/EditAdminModal';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { TextInput } from '@/shared/form/TextInput';
import { useGloss } from '@/shared/i18n/format';
import type { Admin } from '@/features/admins/types';

export function Admins() {
  const t = useTranslations('adminPage');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [list, setList] = useState<Admin[]>(seedAdmins);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }, [list, query]);

  const create = (admin: Admin) => {
    setList((l) => [...l, admin]);
    setAdding(false);
    const n = admin.super ? ALL_PERMISSIONS.length : admin.permissions.length;
    toast.success(t('toast.added', { name: g(admin.name) }), {
      description: t('toast.addedDesc', { n })
    });
  };

  const save = (admin: Admin) => {
    setList((l) => l.map((a) => (a.id === admin.id ? admin : a)));
    setEditing(null);
    toast.success(t('toast.saved', { name: g(admin.name) }), {
      description: t('toast.savedDesc')
    });
  };

  const remove = (admin: Admin) => {
    setList((l) => l.filter((a) => a.id !== admin.id));
    toast.success(t('toast.removed', { name: g(admin.name) }), {
      description: t('toast.removedDesc', { count: list.length - 1 })
    });
  };

  return (
    <div>
      <section className="rounded-xl border border-line bg-surface shadow-card" aria-label={t('listAria')}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-ink">
              <ShieldCheckIcon className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-ink">{t('listAria')}</h2>
              <p className="text-xs text-muted">
                {t('catalogNote', { n: ALL_PERMISSIONS.length, m: 7 })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPh')}
              aria-label={tc('search')}
              className="w-full sm:w-64"
              leading={<SearchIcon className="h-4 w-4" aria-hidden />} />

            <Button
              variant="brand"
              icon={<UserPlusIcon className="h-4 w-4" aria-hidden />}
              onClick={() => setAdding(true)}>
              {t('add')}
            </Button>
          </div>
        </div>

        <div className="divide-y divide-line">
          {visible.map((a) => {
            const count = a.super ? ALL_PERMISSIONS.length : a.permissions.length;
            return (
              <div key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                <Avatar name={g(a.name)} size="md" />
                <div className="min-w-0 flex-1 basis-48">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                    {g(a.name)}
                    {a.super &&
                    <span className="inline-flex items-center gap-1 rounded bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-ink">
                        <CrownIcon className="h-3 w-3" aria-hidden />
                        {t('superBadge')}
                      </span>
                    }
                  </p>
                  <p className="truncate text-xs text-muted">{a.email}</p>
                </div>

                <p className="basis-36 text-xs font-medium text-body">{t(`role.${a.roleKey}`)}</p>

                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  title={t('editPerms')}
                  className="basis-32 text-left text-xs text-muted underline decoration-line hover:decoration-ink transition-colors">
                  {count === ALL_PERMISSIONS.length ?
                  t('superBadge') :
                  <>
                      {t('permsShort')} · <span className="font-semibold tabular-nums text-ink">{count}</span> / {ALL_PERMISSIONS.length}
                    </>
                  }
                </button>

                <div className="flex items-center gap-1">
                  <IconButton
                    icon={<PencilIcon className="h-4 w-4" />}
                    label={t('editAdmin')}
                    onClick={() => setEditing(a)} />

                  <IconButton
                    icon={<Trash2Icon className="h-4 w-4" />}
                    label={t('remove')}
                    variant="danger"
                    disabled={a.super}
                    onClick={() => remove(a)} />

                </div>
              </div>);

          })}
          {visible.length === 0 &&
          <div className="flex flex-col items-center gap-1.5 px-4 py-14 text-center">
              <p className="text-sm font-semibold text-ink">{t('emptyTitle')}</p>
              <p className="text-[13px] text-muted">{t('emptyDesc')}</p>
            </div>
          }
        </div>
      </section>

      <AddAdminModal
        open={adding}
        onClose={() => setAdding(false)}
        onCreate={create}
        takenEmails={list.map((a) => a.email)} />

      <EditAdminModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        admin={editing}
        onSave={save}
        takenEmails={list.filter((a) => a.id !== editing?.id).map((a) => a.email)} />

    </div>);

}
