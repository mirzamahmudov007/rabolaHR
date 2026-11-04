'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ChevronRightIcon, PlusIcon } from 'lucide-react';
import { usePayroll } from '@/shared/context/PayrollContext';
import { TemplateDetail } from '@/features/payroll/components/TemplateDetail';
import { TemplateEditor } from '@/features/payroll/components/TemplateEditor';
import { RulesTable } from '@/features/payroll/components/RulesTable';
import { RuleEditor } from '@/features/payroll/components/RuleEditor';
import { Button } from '@/shared/ui/Button';
import { Tabs } from '@/shared/ui/Tabs';
import { TemplateList } from '@/features/payroll/components/TemplateList';
import { newTemplateId, templateEmployees } from '@/shared/utils/payroll';
import { useScreenInit } from '@/shared/lib/useScreenInit';
import type { PayTemplate, PayrollRule } from '@/shared/types/payroll';

type Tab = 'templates' | 'rules';

interface ScreenState {
  tab?: Tab;
  editor?: 'rule' | 'template';
}


export function Payroll() {
  const t = useTranslations('payroll');
  const steps = [
  { title: t('steps.s1.title'), text: t('steps.s1.text') },
  { title: t('steps.s2.title'), text: t('steps.s2.text') },
  { title: t('steps.s3.title'), text: t('steps.s3.text') }];

  const screen = useScreenInit() as ScreenState;
  const { templates, rules, saveTemplate, saveRule } = usePayroll();
  const [tab, setTab] = useState<Tab>(screen.tab ?? 'templates');
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? '');
  const [tplEditor, setTplEditor] = useState<{open: boolean;template: PayTemplate | null;}>({ open: screen.editor === 'template', template: null });
  const [ruleEditor, setRuleEditor] = useState<{open: boolean;rule: PayrollRule | null;}>({ open: screen.editor === 'rule', rule: null });

  const selected = templates.find((t) => t.id === selectedId) ?? templates[0];

  const tabs: {key: Tab;label: string;count: number;}[] = [
  { key: 'templates', label: t('tabTemplates'), count: templates.length },
  { key: 'rules', label: t('tabRules'), count: rules.length }];


  return (
    <div className="space-y-5">
      <ol className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3" aria-label={t('howAria')}>
        {steps.map((s, i) =>
        <li key={s.title} className="flex items-center gap-3 bg-surface px-5 py-3.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-ink">{i + 1}</span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink">{s.title}</div>
              <div className="truncate text-xs text-muted">{s.text}</div>
            </div>
            {i < steps.length - 1 && <ChevronRightIcon className="ml-auto hidden h-4 w-4 shrink-0 text-subtle sm:block" aria-hidden />}
          </li>
        )}
      </ol>

      <section className="rounded-xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 pt-3">
          <Tabs
            label={t('sectionsAria')}
            value={tab}
            onChange={(k) => setTab(k as Tab)}
            items={tabs.map((t) => ({ key: t.key, label: t.label, count: t.count }))} />
          
          <Button
            onClick={() => tab === 'templates' ? setTplEditor({ open: true, template: null }) : setRuleEditor({ open: true, rule: null })}
            icon={<PlusIcon className="h-4 w-4" aria-hidden />}
            className="mb-2.5">
            {tab === 'templates' ? t('newTemplate') : t('newRule')}
          </Button>
        </div>

        {tab === 'rules' ?
        <RulesTable onEdit={(r) => setRuleEditor({ open: true, rule: r })} /> :

        <div className="grid items-start gap-4 p-4 lg:grid-cols-[300px_minmax(0,1fr)]">
            <TemplateList
              templates={templates}
              selectedId={selected?.id ?? ''}
              onSelect={setSelectedId} />
            {selected ?
          <TemplateDetail
            template={selected}
            onEdit={() => setTplEditor({ open: true, template: selected })}
            onDuplicate={() => {
              const copy = { ...selected, id: newTemplateId(), name: t('copyName', { name: selected.name }) };
              saveTemplate(copy);
              setSelectedId(copy.id);
              toast.success(t('toast.duplicated'), { description: t('toast.duplicatedDesc') });
            }} /> :


          <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">{t('emptyTemplates')}</div>
          }
          </div>
        }
      </section>

      <TemplateEditor
        open={tplEditor.open}
        template={tplEditor.template}
        onClose={() => setTplEditor({ open: false, template: null })}
        onSave={(tpl) => {
          const isNew = !templates.some((x) => x.id === tpl.id);
          saveTemplate(tpl);
          setSelectedId(tpl.id);
          setTab('templates');
          setTplEditor({ open: false, template: null });
          toast.success(isNew ? t('toast.tplCreated') : t('toast.tplUpdated'), {
            description: isNew ? tpl.name : t('toast.tplApplied', { count: templateEmployees(tpl).length })
          });
        }} />
      
      <RuleEditor
        open={ruleEditor.open}
        rule={ruleEditor.rule}
        onClose={() => setRuleEditor({ open: false, rule: null })}
        onSave={(r) => {
          const isNew = !rules.some((x) => x.id === r.id);
          saveRule(r);
          setRuleEditor({ open: false, rule: null });
          const used = templates.filter((tpl) => tpl.ruleIds.includes(r.id)).length;
          toast.success(isNew ? t('toast.ruleCreated') : t('toast.ruleUpdated'), {
            description: isNew ? t('toast.ruleNewDesc') : used ? t('toast.ruleUsed', { count: used }) : r.name
          });
        }} />
      
    </div>);

}