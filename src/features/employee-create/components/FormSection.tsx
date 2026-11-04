'use client';
import React from 'react';

interface FormSectionProps {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FormSection({ id, title, description, children }: FormSectionProps) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-line bg-surface shadow-card" aria-labelledby={`${id}-title`}>
      <header className="border-b border-line px-6 py-4">
        <h2 id={`${id}-title`} className="text-[15px] font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-[13px] text-muted">{description}</p>
      </header>
      <div className="space-y-5 p-6">{children}</div>
    </section>);

}