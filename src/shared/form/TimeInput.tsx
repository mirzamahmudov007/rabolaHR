'use client';
import React, { useEffect, useState } from 'react';
import { ClockIcon } from 'lucide-react';
import { TextInput } from '@/shared/form/TextInput';

interface TimeInputProps {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
}

const mask = (digits: string) => digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2, 4)}` : digits;

function normalize(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  if (!d) return null;
  const [h, m] = d.length <= 2 ? [Number(d), 0] : [Number(d.slice(0, d.length - 2)), Number(d.slice(-2))];
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Typed HH:MM input — auto-inserts the colon and validates on blur. */
export function TimeInput({ id, value, onChange, invalid }: TimeInputProps) {
  const [draft, setDraft] = useState(value);
  const [bad, setBad] = useState(false);

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    const v = normalize(draft);
    if (v) {
      setDraft(v);
      setBad(false);
      if (v !== value) onChange(v);
    } else {
      setDraft(value);
      setBad(false);
    }
  };

  return (
    <TextInput
      id={id}
      inputMode="numeric"
      placeholder="09:00"
      value={draft}
      maxLength={5}
      invalid={invalid || bad}
      leading={<ClockIcon className="h-4 w-4" aria-hidden />}
      className="tabular-nums"
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
        const next = mask(digits);
        setDraft(next);
        if (digits.length === 4) {
          const v = normalize(digits);
          setBad(!v);
          if (v && v !== value) onChange(v);
        } else {
          setBad(false);
        }
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
      }} />);


}