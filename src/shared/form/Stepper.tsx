'use client';
import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix: string;
  label: string;
}

export function Stepper({ value, onChange, min = 0, max = 31, suffix, label }: StepperProps) {
  const btn =
  'flex h-full w-9 items-center justify-center text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent';
  return (
    <div className="flex h-10 items-center overflow-hidden rounded-lg border border-line bg-field" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Kamaytirish">
        <MinusIcon className="h-4 w-4" aria-hidden />
      </button>
      <span className="flex-1 border-x border-line text-center text-sm tabular-nums text-ink">
        <span className="font-semibold">{value}</span> <span className="text-muted">{suffix}</span>
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Ko'paytirish">
        <PlusIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>);

}