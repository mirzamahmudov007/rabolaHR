'use client';
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
        checked ? 'bg-ink' : 'bg-line'}`
        }>
        
        <span
          className={`inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform duration-200 ease-out ${
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`
          } />
        
      </button>
    </label>);

}