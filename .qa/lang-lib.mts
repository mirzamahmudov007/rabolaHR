/**
 * Message-dictionary generator.
 *
 * Author translations here as { uz, ru, en } triples; the script merges them
 * into src/messages/{uz,ru,en}.json and derives src/messages/uz-Cyrl.json from
 * the Uzbek Latin text by transliteration (with a few explicit overrides).
 *
 * Run: npx tsx .qa/lang.mts
 */
import fs from 'node:fs';
import path from 'node:path';
import { transliterate } from '../src/shared/i18n/translit';

type Triple = { uz: string; ru: string; en: string };
type Block = { [key: string]: Triple | Block };

const MSG_DIR = path.resolve('src/messages');

/** Keys whose transliterated Cyrillic reads badly and needs a hand-written form. */
const CYRL_OVERRIDES: Record<string, string> = {
  'common.none': 'Йўқ',
  'common.no': 'Йўқ',
  'common.empty': 'Ҳозирча маълумот йўқ',
  'data.dayState.absent': 'Келмаган',
  'data.dayStateShort.absent': 'Келмади',
  'dates.months.jan': 'Январ',
  'dates.monthsLower.jan': 'январ',
  'dates.months.jun': 'Июнь',
  'dates.monthsLower.jun': 'июнь',
  'dates.months.jul': 'Июль',
  'dates.monthsLower.jul': 'июль',
  'dates.months.sep': 'Сентябр',
  'dates.monthsLower.sep': 'сентябр',
  'dates.months.oct': 'Октябр',
  'dates.monthsLower.oct': 'октябр',
  'dates.weekdaysShort.mon': 'Ду',
  'dates.weekdaysShort.tue': 'Се',
  'dates.weekdaysShort.wed': 'Чор',
  'dates.weekdaysShort.thu': 'Па',
  'dates.weekdaysShort.fri': 'Жу',
  'dates.weekdaysShort.sat': 'Ша',
  'dates.weekdaysShort.sun': 'Як',
  'dates.weekdaysMin.mon': 'Ду',
  'dates.weekdaysMin.tue': 'Се',
  'dates.weekdaysMin.wed': 'Чо',
  'dates.weekdaysMin.thu': 'Па',
  'dates.weekdaysMin.fri': 'Жу',
  'dates.weekdaysMin.sat': 'Ша',
  'dates.weekdaysMin.sun': 'Як',
};

/**
 * Transliterate text but keep ICU placeholder names (`{amount}`, `{count, plural, …}`)
 * untouched, otherwise the message would no longer compile.
 */
function transliterateText(value: string): string {
  const kept: string[] = [];
  const masked = value.replace(/\{[^{}]*\}/g, (m) => {
    kept.push(m);
    return `\u0000${kept.length - 1}\u0000`;
  });
  return transliterate(masked).replace(/\u0000(\d+)\u0000/g, (_, i) => kept[Number(i)]);
}

function isTriple(v: unknown): v is Triple {
  return !!v && typeof v === 'object' && 'uz' in (v as object) && 'ru' in (v as object) && 'en' in (v as object);
}

function collectUz(obj: unknown, prefix = '', sink: Record<string, string> = {}) {
  if (typeof obj === 'string') { sink[prefix] = obj; return sink; }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) collectUz(v, prefix ? `${prefix}.${k}` : k, sink);
  }
  return sink;
}

function pick(obj: Record<string, unknown>, p: string): string | undefined {
  const v = p.split('.').reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
  return typeof v === 'string' ? v : undefined;
}

function applyBlock(dict: Record<string, unknown>, block: Block, lang: 'uz' | 'ru' | 'en') {
  for (const [k, v] of Object.entries(block)) {
    if (isTriple(v)) dict[k] = v[lang];
    else {
      dict[k] = typeof dict[k] === 'object' && dict[k] !== null ? dict[k] : {};
      applyBlock(dict[k] as Record<string, unknown>, v, lang);
    }
  }
}

/** Legacy keys that were replaced by id-based ones and must be dropped. */
const PRUNE: string[] = [
  'data.branch.central', 'data.branch.samarkand', 'data.branch.andijan', 'data.branch.bukhara',
];

function prune(obj: Record<string, unknown>, p: string) {
  const parts = p.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const next = node[parts[i]];
    if (!next || typeof next !== 'object') return;
    node = next as Record<string, unknown>;
  }
  delete node[parts[parts.length - 1]];
}

export function generate(BLOCKS: Block) {
  const read = (f: string) => JSON.parse(fs.readFileSync(path.join(MSG_DIR, f), 'utf8')) as Record<string, unknown>;
  const uz = read('uz.json');
  const ru = read('ru.json');
  const en = read('en.json');

  applyBlock(uz, BLOCKS, 'uz');
  applyBlock(ru, BLOCKS, 'ru');
  applyBlock(en, BLOCKS, 'en');
  PRUNE.forEach((p) => { prune(uz, p); prune(ru, p); prune(en, p); });

  const write = (f: string, obj: unknown) =>
    fs.writeFileSync(path.join(MSG_DIR, f), `${JSON.stringify(obj, null, 2)}\n`, 'utf8');

  write('uz.json', uz);
  write('ru.json', ru);
  write('en.json', en);

  // uz-Cyrl: transliterate the whole Uzbek Latin dictionary, then apply overrides.
  const flat = collectUz(uz);
  const cyrl: Record<string, unknown> = {};
  for (const [p, value] of Object.entries(flat)) {
    const out = CYRL_OVERRIDES[p] ?? transliterateText(value);
    const parts = p.split('.');
    let node = cyrl;
    for (let i = 0; i < parts.length - 1; i += 1) {
      node[parts[i]] = typeof node[parts[i]] === 'object' && node[parts[i]] !== null ? node[parts[i]] : {};
      node = node[parts[i]] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = out;
  }
  write('uz-Cyrl.json', cyrl);

  // Report keys that exist in uz.json but are missing in ru/en.
  const missing: string[] = [];
  for (const p of Object.keys(flat)) {
    if (!pick(ru, p)) missing.push(`ru: ${p}`);
    if (!pick(en, p)) missing.push(`en: ${p}`);
  }
  console.log('uz keys:', Object.keys(flat).length);
  console.log(missing.length ? `MISSING:\n${missing.join('\n')}` : 'ru/en coverage: complete');
  const changed: string[] = [];
  for (const [p, v] of Object.entries(flat)) {
    const expect = CYRL_OVERRIDES[p] ?? transliterateText(v);
    if (pick(read('uz-Cyrl.json'), p) !== expect) changed.push(`${p}: ${v} -> ${expect}`);
  }
  console.log('cyrl sample:', changed.slice(0, 3).join(' | ') || 'up to date');
}
