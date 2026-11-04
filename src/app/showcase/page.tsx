'use client';
import React, { useState } from 'react';
import { UserIcon, BriefcaseIcon } from 'lucide-react';
import { AppShell } from '@/shared/layout/AppShell';
import { Field } from '@/shared/form/Field';
import { TextInput } from '@/shared/form/TextInput';
import { SelectMenu, type SelectOption } from '@/shared/form/SelectMenu';
import { ChipSelect } from '@/shared/form/ChipSelect';
import { TimeInput } from '@/shared/form/TimeInput';
import { MoneyInput } from '@/shared/form/MoneyInput';
import { Stepper } from '@/shared/form/Stepper';
import { Segmented } from '@/shared/form/Segmented';
import { Toggle } from '@/shared/form/Toggle';
import { OptionCard } from '@/shared/form/OptionCard';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Button } from '@/shared/ui/Button';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Drawer } from '@/shared/ui/Drawer';
import { TODAY } from '@/shared/utils/date';

const positions: SelectOption[] = [
  { value: 'dev', label: 'Dasturchi', group: 'IT' },
  { value: 'qa', label: 'Tester', group: 'IT' },
  { value: 'hr', label: 'HR menejer', group: 'Bo\'shqaruv' },
  { value: 'acc', label: 'Buxgalter', group: 'Moliya' }
];

const skills: SelectOption[] = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'next', label: 'Next.js' },
  { value: 'sql', label: 'SQL' }
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Gallery() {
  const [text, setText] = useState('');
  const [pos, setPos] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>(['react']);
  const [time, setTime] = useState('09:00');
  const [money, setMoney] = useState<number | null>(5000000);
  const [days, setDays] = useState(5);
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('day');
  const [notif, setNotif] = useState(true);
  const [plan, setPlan] = useState<'basic' | 'pro'>('pro');
  const [date, setDate] = useState<Date>(TODAY);
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card title="Input / Matn maydoni">
        <Field label="Ism" required hint="Iltimos, to\'liq ismni kiriting">
          <TextInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mirzoahmudov"
            leading={<UserIcon className="h-4 w-4 text-muted" aria-hidden />} />
        </Field>
        <Field label="Email" error="Bu email allaqachon band">
          <TextInput defaultValue="xodim@att.uz" invalid />
        </Field>
      </Card>

      <Card title="Select / Tanlash">
        <Field label="Lavozim">
          <SelectMenu
            value={pos}
            options={positions}
            onChange={setPos}
            placeholder="Lavozim tanlang"
            searchPlaceholder="Qidirish..."
            icon={<BriefcaseIcon className="h-4 w-4 text-muted" aria-hidden />} />
        </Field>
        <Field label="Ko\'nikmalar" hint="Bir nechta tanlash mumkin">
          <ChipSelect
            value={chips}
            options={skills}
            onChange={setChips}
            addLabel="Ko\'nikma qo\'shish"
            creatable />
        </Field>
      </Card>

      <Card title="Sana / Vaqt">
        <Field label="Ishga kirgan sana">
          <DatePicker value={date} onChange={setDate} block />
        </Field>
        <Field label="Ish boshlanishi">
          <TimeInput value={time} onChange={setTime} />
        </Field>
        <p className="text-xs text-muted">
          Range date picker “Hisobot yuklab olish” tugmasida (Xodimlar sahifasi) — ikki kalendar bilan tanlanadi.
        </p>
      </Card>

      <Card title="Raqam / Pul">
        <Field label="Oylik maosh">
          <MoneyInput value={money} onChange={setMoney} />
        </Field>
        <Field label="Ish kunlari">
          <Stepper value={days} onChange={setDays} min={1} max={7} suffix="kun" label="Ish kunlari soni" />
        </Field>
      </Card>

      <Card title="Segmented / Toggle">
        <div>
          <div className="mb-2 text-sm font-medium text-ink">Davr</div>
          <Segmented
            value={seg}
            onChange={setSeg}
            label="Hisobot davri"
            options={[
              { value: 'day', label: 'Kun' },
              { value: 'week', label: 'Hafta' },
              { value: 'month', label: 'Oy' }
            ]} />
        </div>
        <Toggle
          checked={notif}
          onChange={setNotif}
          label="Bildirishnomalar"
          description="Kechikishlar haqida push xabar yuborilsin" />
      </Card>

      <Card title="OptionCard / Drawer / Tooltip">
        <div className="grid grid-cols-2 gap-3">
          <OptionCard selected={plan === 'basic'} title="Bazaviy" description="50 xodimgacha" onSelect={() => setPlan('basic')} />
          <OptionCard selected={plan === 'pro'} title="Pro" description="Cheksiz xodim" onSelect={() => setPlan('pro')} />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setDrawer(true)}>
            Drawer ochish
          </Button>
          <Tooltip content="Bu yordamchi matn — Tooltip komponenti 1:1 ko\'chirilgan.">
            <span className="cursor-help text-sm font-medium text-muted underline decoration-dotted">Yordam?</span>
          </Tooltip>
        </div>
      </Card>

      <Drawer
        open={drawer}
        title="Xodim qo\'shish"
        subtitle="Demo drawer — 1:1 Drawer komponenti"
        onClose={() => setDrawer(false)}
        footer={
          <Button onClick={() => setDrawer(false)}>
            Yopish
          </Button>
        }>
        <Field label="Ism" required>
          <TextInput placeholder="Ism familiya" />
        </Field>
      </Drawer>
    </div>);

}

export default function ShowcasePage() {
  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-ink">Komponentlar galereyasi</h1>
        <p className="mt-1 text-sm text-muted">Barcha shared UI komponentlari — Next.js App Router, 1:1 nusxa</p>
      </div>
      <Gallery />
    </AppShell>);

}
