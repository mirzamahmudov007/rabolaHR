'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { differenceInYears, subYears } from 'date-fns';
import { UsersIcon } from 'lucide-react';
import { FormSection } from '@/features/employee-create/components/FormSection';
import { PhotoUpload } from '@/features/employee-create/components/PhotoUpload';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { Segmented } from '@/shared/form/Segmented';
import { DatePicker } from '@/shared/ui/DatePicker';
import { findDuplicates, formatPhone } from '@/shared/utils/employeeForm';
import { useGloss } from '@/shared/i18n/format';
import { TODAY } from '@/shared/utils/date';
import type { EmployeeForm, FormErrors } from '@/shared/types/employeeForm';

interface SectionProps {
  form: EmployeeForm;
  set: <K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) => void;
  errors: FormErrors;
}

export function PersonalSection({ form, set, errors }: SectionProps) {
  const t = useTranslations('create.personal');
  const te = useTranslations('create.err');
  const tg = useTranslations('data.gender');
  const { g } = useGloss();
  const { nameMatch, phoneMatch, codeMatch } = findDuplicates(form);
  const age = form.birthDate ? differenceInYears(TODAY, form.birthDate) : null;

  return (
    <FormSection id="personal" title={t('title')} description={t('desc')}>
      <PhotoUpload value={form.photo} onChange={(v) => set('photo', v)} />

      <div className="h-px bg-line" />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label={t('lastName')} htmlFor="lastName" required error={errors.lastName}>
          <TextInput id="lastName" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder={t('phLastName')} invalid={!!errors.lastName} autoComplete="family-name" />
        </Field>
        <Field label={t('firstName')} htmlFor="firstName" required error={errors.firstName}>
          <TextInput id="firstName" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder={t('phFirstName')} invalid={!!errors.firstName} autoComplete="given-name" />
        </Field>
        <Field label={t('middleName')} htmlFor="middleName" optional>
          <TextInput id="middleName" value={form.middleName} onChange={(e) => set('middleName', e.target.value)} placeholder={t('phMiddle')} />
        </Field>
      </div>

      {nameMatch &&
      <div className="flex items-start gap-3 rounded-lg border border-late/25 bg-late-soft px-4 py-3">
          <UsersIcon className="mt-0.5 h-4 w-4 shrink-0 text-late-ink" aria-hidden />
          <div className="min-w-0 text-[13px]">
            <p className="font-semibold text-late-ink">{t('dupTitle')}</p>
            <p className="mt-0.5 text-late-ink/80">
              {t('dupBody', { name: g(nameMatch.name), code: nameMatch.code, position: g(nameMatch.position), branch: g(nameMatch.branch) })}
            </p>
          </div>
        </div>
      }

      <div className="grid gap-5 sm:grid-cols-3">
        <Field
          label={t('phone')}
          htmlFor="phone"
          required
          error={errors.phone ?? (phoneMatch ? te('phoneTaken', { name: g(phoneMatch.name), code: phoneMatch.code }) : undefined)}>
          
          <TextInput
            id="phone"
            inputMode="tel"
            leading="+998"
            value={formatPhone(form.phone)}
            onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
            placeholder="(90) 123-45-67"
            invalid={!!errors.phone || !!phoneMatch}
            className="tabular-nums" />
          
        </Field>
        <Field label={t('birthDate')} htmlFor="birthDate" optional hint={age !== null ? t('yearsOld', { age }) : undefined}>
          <DatePicker
            id="birthDate"
            block
            value={form.birthDate}
            onChange={(d) => set('birthDate', d)}
            maxDate={subYears(TODAY, 16)}
            defaultMonth={subYears(TODAY, 25)} />
          
        </Field>
        <Field label={t('gender')}>
          <Segmented
            label={t('gender')}
            value={form.gender}
            onChange={(v) => set('gender', v)}
            options={[
            { value: 'male', label: tg('male') },
            { value: 'female', label: tg('female') }]
            } />
          
        </Field>
      </div>

      <Field
        label={t('code')}
        htmlFor="code"
        required
        error={errors.code ?? (codeMatch ? te('codeTaken', { name: g(codeMatch.name) }) : undefined)}
        hint={t('codeHint')}
        className="sm:max-w-[calc(33.333%-0.85rem)]">
        
        <TextInput
          id="code"
          value={form.code}
          onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 10))}
          invalid={!!errors.code || !!codeMatch}
          className="font-medium tabular-nums" />
        
      </Field>
    </FormSection>);

}