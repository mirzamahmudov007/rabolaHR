'use client';
import React from 'react';
import { kindMeta } from '@/shared/data/payrollTriggers';
import { useGloss } from '@/shared/i18n/format';
import { describeRule, ruleExtras } from '@/shared/utils/payroll';
import type { PayrollRule } from '@/shared/types/payroll';

interface RuleLineProps {
  rule: PayrollRule;
  muted?: boolean;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
}

/** One rule rendered as a readable sentence. */
export function RuleLine({ rule, muted, badge, trailing }: RuleLineProps) {
  const { g } = useGloss();
  const extras = ruleExtras(rule);
  return (
    <div className={`flex items-start gap-3 py-3 ${muted ? 'opacity-55' : ''}`}>
      <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${kindMeta[rule.kind].dot}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink">{g(rule.name)}</span>
          {badge}
        </div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-body">{describeRule(rule)}</p>
        {extras.length > 0 && <p className="mt-0.5 text-xs text-muted">{extras.join(' · ')}</p>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>);

}