'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { initialRules, initialTemplates } from '@/shared/data/payroll';
import type { PayTemplate, PayrollRule } from '@/shared/types/payroll';

interface PayrollContextValue {
  rules: PayrollRule[];
  templates: PayTemplate[];
  saveRule: (rule: PayrollRule) => void;
  toggleRule: (id: string) => void;
  saveTemplate: (t: PayTemplate) => void;
  deleteTemplate: (id: string) => void;
}

const PayrollContext = createContext<PayrollContextValue | null>(null);

const upsert = <T extends {id: string;},>(list: T[], item: T) =>
list.some((x) => x.id === item.id) ? list.map((x) => x.id === item.id ? item : x) : [...list, item];

export function PayrollProvider({ children }: {children: React.ReactNode;}) {
  const [rules, setRules] = useState<PayrollRule[]>(initialRules);
  const [templates, setTemplates] = useState<PayTemplate[]>(initialTemplates);

  const value = useMemo<PayrollContextValue>(
    () => ({
      rules,
      templates,
      saveRule: (r) => setRules((l) => upsert(l, r)),
      toggleRule: (id) => setRules((l) => l.map((r) => r.id === id ? { ...r, active: !r.active } : r)),
      saveTemplate: (t) => setTemplates((l) => upsert(l, t)),
      deleteTemplate: (id) => setTemplates((l) => l.filter((t) => t.id !== id))
    }),
    [rules, templates]
  );

  return <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>;
}

export function usePayroll() {
  const ctx = useContext(PayrollContext);
  if (!ctx) throw new Error('usePayroll must be used inside PayrollProvider');
  return ctx;
}