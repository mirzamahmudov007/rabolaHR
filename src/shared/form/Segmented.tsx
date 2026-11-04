'use client';
import React from 'react';

interface SegmentedProps<T extends string | number> {
  value: T;
  options: {value: T;label: string;}[];
  onChange: (v: T) => void;
  label: string;
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="inline-flex h-10 rounded-lg border border-line bg-field p-1" role="radiogroup" aria-label={label}>
      {options.map((o) =>
      <button
        key={String(o.value)}
        type="button"
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={`whitespace-nowrap rounded-md px-3 text-[13px] font-medium transition-colors duration-150 ${
        value === o.value ? 'bg-surface text-ink shadow-card ring-1 ring-line' : 'text-muted hover:text-ink'}`
        }>
        
          {o.label}
        </button>
      )}
    </div>);

}