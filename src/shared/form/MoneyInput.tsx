'use client';
import React from 'react';
import { TextInput } from '@/shared/form/TextInput';
import { formatMoney, parseMoney } from '@/shared/utils/employeeForm';

interface MoneyInputProps {
  id?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  invalid?: boolean;
  placeholder?: string;
  suffix?: string;
}

export function MoneyInput({ id, value, onChange, invalid, placeholder = '0', suffix = "so'm" }: MoneyInputProps) {
  return (
    <TextInput
      id={id}
      inputMode="numeric"
      value={formatMoney(value)}
      onChange={(e) => onChange(parseMoney(e.target.value))}
      placeholder={placeholder}
      invalid={invalid}
      trailing={suffix}
      className="tabular-nums" />);


}