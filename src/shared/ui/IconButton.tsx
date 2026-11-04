'use client';
import React from 'react';

export type IconButtonVariant = 'default' | 'danger';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon-only action; label is used for aria-label and native tooltip. */
  icon: React.ReactNode;
  label: string;
  variant?: IconButtonVariant;
}

const variants: Record<IconButtonVariant, string> = {
  default: 'text-muted hover:bg-canvas hover:text-ink',
  danger: 'text-muted hover:bg-absent-soft hover:text-absent-ink'
};

export function IconButton({ icon, label, variant = 'default', className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
