'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CheckCircle2Icon, SendIcon, SparklesIcon } from 'lucide-react';
import { DEFAULT_TELEGRAM } from '@/features/settings/data/telegram';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { Toggle } from '@/shared/form/Toggle';
import { useGloss } from '@/shared/i18n/format';
import type { TelegramSettings, TelegramTopic, TopicRule } from '@/features/settings/types';

/** Chat ids look like -100xxxxxxxxxx; thread ids are plain positive numbers. */
const CHAT_RE = /^-\d{8,16}$/;
const THREAD_RE = /^\d{1,9}$/;

const ruleStyle: Record<TopicRule, string> = {
  in: 'bg-present-soft text-present-ink',
  out: 'bg-type-regular-soft text-type-regular-ink',
  unknown: 'bg-absent-soft text-absent-ink',
  system: 'bg-leave-soft text-leave-ink'
};

export function Settings() {
  const t = useTranslations('settingsPage');
  const tc = useTranslations('common');
  const { g } = useGloss();
  const [draft, setDraft] = useState<TelegramSettings>(DEFAULT_TELEGRAM);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => setDraft(DEFAULT_TELEGRAM), []);

  const set = (patch: Partial<TelegramSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const setTopic = (id: string, patch: Partial<TelegramTopic>) =>
  setDraft((d) => ({ ...d, topics: d.topics.map((tp) => tp.id === id ? { ...tp, ...patch } : tp) }));


  const chatOk = CHAT_RE.test(draft.chatId.trim());
  const topicBad = (tp: TelegramTopic) => draft.enabled && tp.active && !THREAD_RE.test(tp.threadId.trim());
  const valid = chatOk && !draft.topics.some(topicBad);

  const save = () => {
    setTried(true);
    if (!valid) return;
    setSaving(true);
    // Simulated PUT to the backend tenant-config endpoint.
    window.setTimeout(() => {
      setSaving(false);
      toast.success(t('toast.saved'), { description: t('toast.savedDesc') });
    }, 700);
  };

  const test = () => {
    const target = draft.topics.find((tp) => tp.active && THREAD_RE.test(tp.threadId.trim()));
    setTried(true);
    if (!chatOk || !target) return;
    setTesting(true);
    window.setTimeout(() => {
      setTesting(false);
      toast.success(t('toast.testSent'), { description: t('toast.testSentDesc', { name: g(target.name) }) });
    }, 900);
  };

  return (
    <div className="max-w-3xl space-y-4">
      <section className="rounded-xl border border-line bg-surface shadow-card">
        <div className="border-b border-line px-4 py-3.5">
          <h2 className="text-sm font-semibold tracking-tight text-ink">{t('tgTitle')}</h2>
          <p className="mt-0.5 text-[13px] text-muted">{t('tgDesc')}</p>
        </div>

        <div className="space-y-5 p-4">
          {/* Bot status + master switch */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-canvas/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-ink">
                <SendIcon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">@att_davomat_bot</p>
                <p className="text-xs text-muted">
                  {draft.connected ?
                  <>
                      <span className="font-medium text-present-ink">{t('botConnected')}</span> · {' '}
                      {t('botLastSeen', { n: draft.lastCheckedMinutes })}
                    </> :

                  <span className="text-absent-ink">—</span>
                  }
                </p>
              </div>
            </div>
            <div className="min-w-48 flex-1 basis-56">
              <Toggle
                checked={draft.enabled}
                onChange={(enabled) => set({ enabled })}
                label={t('masterOn')}
                description={t('masterHint')} />
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-lg border border-line bg-canvas/60 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
              <SparklesIcon className="h-4 w-4 text-brand" aria-hidden />
              {t('howTitle')}
            </p>
            <ol className="list-decimal space-y-1.5 pl-4 text-[13px] leading-relaxed text-body">
              <li>{t('how1')}</li>
              <li>{t('how2')}</li>
              <li>{t('how3')}</li>
            </ol>
          </div>

          {/* Group id + master-coupled topics layout */}
          <Field
            label={t('chatLabel')}
            required
            error={tried && !chatOk ? t('chatErr') : undefined}>

            <TextInput
              value={draft.chatId}
              onChange={(e) => set({ chatId: e.target.value })}
              placeholder={t('chatPh')}
              aria-label={t('chatLabel')}
              className="font-mono" />

          </Field>

          {/* Topics */}
          <div>
            <p className="text-sm font-semibold text-ink">{t('topicsTitle')}</p>
            <p className="mt-0.5 text-xs text-muted">{t('topicsDesc')}</p>
            <div className="mt-3 space-y-2.5">
              {draft.topics.map((tp) =>
              <div
                key={tp.id}
                className={`rounded-lg border px-3.5 py-3 transition-colors duration-150 ${
                tp.active && draft.enabled ? 'border-line bg-surface' : 'border-line bg-canvas/40'}`
                }>
                
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${ruleStyle[tp.rule]}`}>
                        {t(`rule${tp.rule[0].toUpperCase()}${tp.rule.slice(1)}`)}
                      </span>
                      <TextInput
                        value={tp.name}
                        onChange={(e) => setTopic(tp.id, { name: e.target.value })}
                        aria-label={t('nameLabel')}
                        className="min-w-36 flex-1 basis-40" />

                      <TextInput
                        value={tp.threadId}
                        onChange={(e) => setTopic(tp.id, { threadId: e.target.value })}
                        placeholder={t('threadPh')}
                        aria-label={t('threadLabel')}
                        inputMode="numeric"
                        className={`w-28 font-mono ${tried && topicBad(tp) ? 'border-absent-ink' : ''}`} />

                      <button
                        type="button"
                        role="switch"
                        aria-checked={tp.active}
                        aria-label={`${tp.name} — ${t('masterOn')}`}
                        onClick={() => setTopic(tp.id, { active: !tp.active })}
                        className={`relative ml-auto inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
                        tp.active && draft.enabled ? 'bg-ink' : 'bg-line'}`
                        }>
                        
                          <span
                          className={`inline-block h-4 w-4 rounded-full bg-surface shadow transition-transform duration-200 ease-out ${
                          tp.active && draft.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'}`
                          } />
                        
                      </button>

                    </div>
                    {tried && topicBad(tp) &&
                  <p className="mt-1.5 text-xs font-medium text-absent-ink">
                        {t('threadErr', { name: g(tp.name) })}
                      </p>
                  }
                    {!tp.active &&
                  <p className="mt-1.5 text-xs text-subtle">{t('offNote')}</p>
                  }
                  </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line px-4 py-3.5">
          <Button
            variant="ghost"
            icon={<CheckCircle2Icon className="h-4 w-4" aria-hidden />}
            onClick={test}
            disabled={testing || !draft.enabled}>
            {testing ? t('testing') : t('test')}
          </Button>
          <Button variant="brand" onClick={save} disabled={saving}>
            {saving ? tc('saving') : tc('save')}
          </Button>
        </div>
      </section>
    </div>);

}
