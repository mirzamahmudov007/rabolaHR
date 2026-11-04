'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckMark } from '@/shared/form/OptionCard';
import { CheckboxField } from '@/shared/ui/CheckboxField';
import { PERM_CATALOG, ALL_PERMISSIONS } from '../types';
import type { PermissionId } from '../types';

interface PermissionMatrixProps {
  selected: PermissionId[];
  onChange: (selected: PermissionId[]) => void;
  /** Super admin mode — the whole catalog is on, editing is disabled. */
  fullAccess?: boolean;
}

/**
 * Grouped permission editor: one card per page/area, group header toggles
 * the whole group, rows toggle single actions.
 */
export function PermissionMatrix({ selected, onChange, fullAccess }: PermissionMatrixProps) {
  const tp = useTranslations('permissions');
  const t = useTranslations('adminPage');
  const chosen = fullAccess ? new Set(ALL_PERMISSIONS) : new Set(selected);

  const idsOf = (group: string, actions: string[]) => actions.map((a) => `${group}.${a}`);

  const toggleOne = (id: PermissionId) => {
    if (fullAccess) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);else next.add(id);
    onChange([...next]);
  };

  const toggleGroup = (group: string, actions: string[]) => {
    if (fullAccess) return;
    const groupIds = idsOf(group, actions);
    const allOn = groupIds.every((id) => selected.includes(id));
    if (allOn) onChange(selected.filter((id) => !groupIds.includes(id)));else
    onChange([...new Set([...selected, ...groupIds])]);
  };

  const setAll = (on: boolean) => onChange(on && !fullAccess ? [...ALL_PERMISSIONS] : []);

  const labelFor = (group: string, action: string) =>
  group === 'payroll' && action === 'view' ? tp('viewOf') : tp(`action.${action}`);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <p className="text-muted">{t('permHelper')}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAll(true)}
            disabled={fullAccess}
            className="rounded px-1.5 py-0.5 font-medium text-ink underline decoration-line hover:decoration-ink transition-colors disabled:opacity-40">
            {t('pickAll')}
          </button>
          <span className="text-subtle">·</span>
          <button
            type="button"
            onClick={() => setAll(false)}
            disabled={fullAccess}
            className="rounded px-1.5 py-0.5 font-medium text-ink underline decoration-line hover:decoration-ink transition-colors disabled:opacity-40">
            {t('pickNone')}
          </button>
        </div>
      </div>

      {PERM_CATALOG.map(({ group, actions }) => {
        const groupIds = idsOf(group, actions);
        const onCount = groupIds.filter((id) => chosen.has(id)).length;
        const allOn = onCount === groupIds.length;
        return (
          <section key={group} className="rounded-xl border border-line bg-surface">
            <button
              type="button"
              onClick={() => toggleGroup(group, actions)}
              disabled={fullAccess}
              aria-pressed={allOn}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-canvas disabled:hover:bg-transparent">
              
              <CheckMark checked={allOn} />
              <span className="flex-1 text-sm font-semibold text-ink">{tp(`group.${group}`)}</span>
              <span className={`text-xs tabular-nums ${onCount ? 'text-muted' : 'text-subtle'}`}>
                {onCount} / {groupIds.length}
              </span>
            </button>
            <div className="grid gap-x-4 gap-y-2 border-t border-line px-3.5 py-3 sm:grid-cols-2">
              {actions.map((action) => (
                <CheckboxField
                  key={action}
                  checked={chosen.has(`${group}.${action}`)}
                  onChange={() => toggleOne(`${group}.${action}`)}
                  className={fullAccess ? 'pointer-events-none opacity-60' : ''}>

                  {labelFor(group, action)}
                </CheckboxField>))}
            </div>
          </section>);

      })}

      <p className="text-xs text-muted">
        {t('chosen', { n: chosen.size, m: ALL_PERMISSIONS.length })}
      </p>
    </div>);

}
