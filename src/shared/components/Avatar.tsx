'use client';
import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-16 w-16 text-lg'
};

export function Avatar({ name, src, size = 'md' }: {name: string;src?: string;size?: AvatarSize;}) {
  const box = `shrink-0 rounded-full object-cover ring-1 ring-line ${sizeClass[size]}`;
  if (src) {
    return (
      <img src={src} alt={name} className={box} loading="lazy" />);

  }
  const initials = name.
  split(' ').
  map((p) => p[0]).
  slice(0, 2).
  join('').
  toUpperCase();
  return (
    <span
      className={`flex items-center justify-center overflow-hidden rounded-full bg-brand-soft font-semibold text-body ring-1 ring-line ${sizeClass[size]}`}
      aria-hidden>
      
      {initials}
    </span>);

}