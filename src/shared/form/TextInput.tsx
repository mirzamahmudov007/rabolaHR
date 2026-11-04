'use client';
import React, { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
{ invalid, leading, trailing, className = '', ...props },
ref)
{
  return (
    <div
      className={`flex h-10 items-center rounded-lg border bg-field transition-colors duration-150 focus-within:border-ink/40 ${
      invalid ? 'border-absent/60' : 'border-line hover:border-ink/20'} ${
      className}`}>
      
      {leading && <span className="flex shrink-0 items-center pl-3 text-sm text-muted">{leading}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-subtle"
        {...props} />
      
      {trailing && <span className="flex shrink-0 items-center pr-3 text-sm text-muted">{trailing}</span>}
    </div>);

});