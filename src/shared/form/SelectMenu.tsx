'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useDismiss } from '@/shared/hooks/useDismiss';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
  hint?: string;
}

interface SelectMenuProps {
  id?: string;
  value: string | null;
  options: SelectOption[];
  onChange: (v: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  invalid?: boolean;
  creatable?: boolean;
  icon?: React.ReactNode;
}

export function SelectMenu({
  id,
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  invalid,
  creatable,
  icon
}: SelectMenuProps) {
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const map = new Map<string, SelectOption[]>();
    options.
    filter((o) => !q || o.label.toLowerCase().includes(q) || o.group?.toLowerCase().includes(q)).
    forEach((o) => map.set(o.group ?? '', [...(map.get(o.group ?? '') ?? []), o]));
    return Array.from(map.entries());
  }, [options, q]);

  const resultCount = groups.reduce((s, [, l]) => s + l.length, 0);
  const exact = options.some((o) => o.label.toLowerCase() === q);
  const selected = options.find((o) => o.value === value);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid || undefined}
        className={`flex h-10 w-full items-center gap-2 rounded-lg border bg-field px-3 text-left text-sm transition-colors duration-150 ${
        invalid ? 'border-absent/60' : open ? 'border-ink/40' : 'border-line hover:border-ink/20'}`
        }>
        
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className={`min-w-0 flex-1 truncate ${selected || value ? 'text-ink' : 'text-subtle'}`}>
          {selected?.label ?? value ?? placeholder}
        </span>
        <ChevronsUpDownIcon className="h-4 w-4 shrink-0 text-subtle" aria-hidden />
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 top-full z-40 mt-1.5 w-full min-w-[260px] overflow-hidden rounded-lg border border-line bg-surface shadow-xl">
          
            <div className="relative border-b border-line">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
              <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && creatable && q && !exact) {
                  e.preventDefault();
                  pick(query.trim());
                }
              }}
              placeholder={searchPlaceholder ?? tc('search')}
              className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-ink outline-none placeholder:text-subtle" />
            
            </div>
            <div className="max-h-64 overflow-y-auto p-1" role="listbox">
              {groups.map(([group, list]) =>
            <div key={group || 'default'}>
                  {group && <div className="px-2 pb-1 pt-2 text-[11px] font-semibold text-subtle">{group}</div>}
                  {list.map((o) =>
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => pick(o.value)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-body transition-colors duration-100 hover:bg-canvas">
                
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        {o.value === value && <CheckIcon className="h-4 w-4 text-ink" strokeWidth={2.5} aria-hidden />}
                      </span>
                      <span className={`min-w-0 flex-1 truncate ${o.value === value ? 'font-semibold text-ink' : ''}`}>{o.label}</span>
                      {o.hint && <span className="shrink-0 text-xs tabular-nums text-subtle">{o.hint}</span>}
                    </button>
              )}
                </div>
            )}
              {creatable && q && !exact &&
            <button
              type="button"
              onClick={() => pick(query.trim())}
              className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-line px-2 py-2 text-left text-[13px] text-ink transition-colors duration-100 hover:bg-canvas">
              
                  <PlusIcon className="h-4 w-4 text-muted" aria-hidden />
                  {tc('addValue', { value: query.trim() })}
                </button>
            }
              {resultCount === 0 && !creatable &&
            <p className="px-3 py-6 text-center text-[13px] text-muted">{tc('noResults')}</p>
            }
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}