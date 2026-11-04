'use client';
import React, { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger' | 'neutral' | 'brand' | 'subtle' | 'dashed';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full-width button. */
  block?: boolean;
  /** Leading icon rendered before the label. */
  icon?: React.ReactNode;
}

const base =
'inline-flex items-center justify-center gap-2 rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-surface transition-opacity duration-150 hover:opacity-90',
  secondary: 'border border-line bg-surface text-ink transition-colors duration-150 hover:bg-canvas',
  ghost: 'text-muted transition-colors duration-150 hover:bg-canvas hover:text-ink',
  link: 'text-muted transition-colors duration-150 hover:text-ink',
  danger: 'text-absent-ink transition-colors duration-150 hover:bg-absent-soft',
  neutral: 'text-body transition-colors duration-150 hover:bg-canvas',
  brand: 'bg-brand text-on-brand transition-colors duration-150 hover:bg-brand-hover',
  subtle: 'text-ink transition-colors duration-150 hover:bg-canvas',
  dashed: 'border border-dashed border-line text-ink transition-colors duration-150 hover:border-ink/30 hover:bg-surface-2'
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm'
};

/** Shared action button. Keeps button styling consistent across every page. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, icon, className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${
      variant === 'link' ? '' : sizes[size]} ${block ? 'w-full' : ''} ${className}`}
      {...props}>
      
      {icon}
      {children}
    </button>);

});
