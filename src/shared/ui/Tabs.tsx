'use client';
import React from 'react';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  /** Highlights the count badge in the alert (absent) palette. */
  alert?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  label?: string;
}

/** Shared underline tab list with an optional count badge on each tab. */
export function Tabs({ items, value, onChange, label }: TabsProps) {
  return (
    <div className="-mb-px flex gap-1 overflow-x-auto" role="tablist" aria-label={label}>
      {items.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-3 pt-1.5 text-sm transition-colors duration-150 ${
            active ? 'border-ink font-medium text-ink' : 'border-transparent text-muted hover:text-ink'}`}>
            
            {t.label}
            {typeof t.count === 'number' &&
            <span
              className={`rounded px-1.5 text-xs font-semibold tabular-nums ${
              t.alert ? 'bg-absent-soft text-absent-ink' : 'bg-brand-soft text-muted'}`}>
              
                {t.count}
              </span>
            }
          </button>);

      })}
    </div>);

}
