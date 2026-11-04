'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircleIcon, AlertTriangleIcon } from 'lucide-react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  warning?: React.ReactNode;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, required, optional, hint, warning, error, className = '', children }: FieldProps) {
  const tc = useTranslations('common');
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-body">
          {label}
          {required && <span className="ml-0.5 text-absent-ink">*</span>}
        </label>
        {optional && <span className="text-xs text-subtle">{tc('optional')}</span>}
      </div>
      {children}
      {error ?
      <p className="mt-1.5 flex items-start gap-1 text-xs text-absent-ink" role="alert">
          <AlertCircleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p> :
      warning ?
      <p className="mt-1.5 flex items-start gap-1 text-xs text-late-ink">
          <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{warning}</span>
        </p> :
      hint ?
      <p className="mt-1.5 text-xs text-subtle">{hint}</p> :
      null}
    </div>);

}