'use client';
import React from 'react';
import { CheckMark } from '@/shared/form/OptionCard';

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

/** Accessible labelled checkbox: sr-only native input + shared CheckMark visual. */
export function CheckboxField({ checked, onChange, children, className = '' }: CheckboxFieldProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 text-[13px] text-body ${className}`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <CheckMark checked={checked} />
      {children}
    </label>);

}
