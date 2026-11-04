'use client';
import React from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { SelectMenu } from '@/shared/form/SelectMenu';
import type { SelectOption } from '@/shared/form/SelectMenu';

interface ChipSelectProps {
  value: string[];
  options: SelectOption[];
  onChange: (v: string[]) => void;
  addLabel: string;
  emptyText?: string;
  creatable?: boolean;
}

/** Multi-select rendered as removable chips plus an "add" picker. */
export function ChipSelect({ value, options, onChange, addLabel, emptyText, creatable }: ChipSelectProps) {
  const remaining = options.filter((o) => !value.includes(o.value));
  return (
    <div className="space-y-2">
      {value.length > 0 ?
      <ul className="flex flex-wrap gap-1.5">
          {value.map((v) =>
        <li key={v} className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface pl-2.5 pr-1 text-[13px] text-ink">
              {options.find((o) => o.value === v)?.label ?? v}
              <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== v))}
            className="flex h-5 w-5 items-center justify-center rounded text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink"
            aria-label={`${v} ni olib tashlash`}>
            
                <XIcon className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
        )}
        </ul> :

      emptyText && <p className="text-[13px] text-muted">{emptyText}</p>
      }
      <div className="sm:max-w-xs">
        <SelectMenu
          value={null}
          options={remaining}
          onChange={(v) => onChange([...value, v])}
          placeholder={addLabel}
          creatable={creatable}
          icon={<PlusIcon className="h-4 w-4" />} />
        
      </div>
    </div>);

}