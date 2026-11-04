'use client';
import React from 'react';
import { useGloss } from '@/shared/i18n/format';
import { kindMeta } from '@/shared/data/payrollTriggers';
import type { RuleKind } from '@/shared/types/payroll';

export function RuleKindBadge({ kind }: {kind: RuleKind;}) {
  const { g } = useGloss();
  const m = kindMeta[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${m.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} aria-hidden />
      {g(m.label)}
    </span>);

}