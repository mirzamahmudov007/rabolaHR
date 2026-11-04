'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useGloss } from '@/shared/i18n/format';
import { payBaseText, templateEmployees } from '@/shared/utils/payroll';
import type { PayTemplate } from '@/shared/types/payroll';

interface TemplateListProps {
  templates: PayTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Selectable payroll template list (aria listbox of options). */
export function TemplateList({ templates, selectedId, onSelect }: TemplateListProps) {
  const t = useTranslations('payroll.list');
  const { g } = useGloss();
  return (
    <ul className="space-y-1.5" role="listbox" aria-label={t('aria')}>
      {templates.map((tpl) => {
        const active = tpl.id === selectedId;
        return (
          <li key={tpl.id}>
            <button
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(tpl.id)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors duration-150 ${
              active ? 'border-line bg-surface-2' : 'border-transparent hover:bg-surface-2'}`}>
              
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{g(tpl.name)}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />}
              </div>
              <div className="mt-0.5 text-[13px] tabular-nums text-body">{payBaseText(tpl)}</div>
              <div className="mt-1 text-xs text-muted">
                {t('meta', { rules: tpl.ruleIds.length, people: templateEmployees(tpl).length })}
              </div>
            </button>
          </li>);

      })}
    </ul>);

}
