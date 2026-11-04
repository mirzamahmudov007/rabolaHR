'use client';
import React from 'react';
import { CheckIcon } from 'lucide-react';

interface OptionCardProps {
  selected: boolean;
  title: string;
  description: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

export function OptionCard({ selected, title, description, icon, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-full w-full items-start gap-3 rounded-lg border border-line p-3.5 text-left transition-colors duration-150 ${
      selected ? 'bg-surface-2' : 'bg-surface hover:border-ink/20'}`
      }>
      
      {icon &&
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-soft transition-colors duration-150 ${
        selected ? 'text-ink' : 'text-muted'}`
        }>
        
          {icon}
        </span>
      }
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">{description}</span>
      </span>
      <CheckMark checked={selected} round />
    </button>);

}

export function CheckMark({ checked, round }: {checked: boolean;round?: boolean;}) {
  return (
    <span
      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-colors duration-150 ${
      round ? 'rounded-full' : 'rounded-[5px]'} ${
      checked ? 'border-ink bg-ink text-surface' : 'border-line bg-surface'}`}
      aria-hidden>
      
      {checked && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
    </span>);

}