'use client';
import React from 'react';

export interface InfoRow {
label: string;value: React.ReactNode;}



export function InfoSection({ title, icon, rows }: {title: string;icon?: React.ReactNode;rows: InfoRow[];}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {title}
      </h2>
      <dl className="mt-2 divide-y divide-line">
        {rows.map((r) =>
        <div key={r.label} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[13px] text-muted">{r.label}</dt>
            <dd className="max-w-[60%] text-right text-[13px] font-medium text-ink">{r.value}</dd>
          </div>
        )}
      </dl>
    </section>);

}
