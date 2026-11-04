/**
 * Uzbek Latin -> Uzbek Cyrillic transliteration.
 *
 * The two Uzbek alphabets map almost 1:1, so this is used as a fallback for
 * values with no explicit entry in the message dictionaries (person names and
 * other free-form data strings). Letters carrying a modifier apostrophe
 * (oʻ, gʻ, qʻ, hʼ) and the yod combinations are handled by rules.
 */

const SIMPLE: Record<string, [string, string]> = {
  a: ['А', 'а'], b: ['Б', 'б'], v: ['В', 'в'], g: ['Г', 'г'], d: ['Д', 'д'],
  e: ['Е', 'е'], f: ['Ф', 'ф'], j: ['Ж', 'ж'], k: ['К', 'к'], l: ['Л', 'л'],
  m: ['М', 'м'], n: ['Н', 'н'], o: ['О', 'о'], p: ['П', 'п'], r: ['Р', 'р'],
  s: ['С', 'с'], t: ['Т', 'т'], u: ['У', 'у'], x: ['Х', 'х'], y: ['Й', 'й'],
  z: ['З', 'з'], c: ['Ц', 'ц'], w: ['У', 'у'], q: ['Қ', 'қ'], h: ['Ҳ', 'ҳ'],
  i: ['И', 'и'],
};

const DIGRAPHS: Record<string, [string, string]> = {
  sh: ['Ш', 'ш'], ch: ['Ч', 'ч'], zh: ['Ж', 'ж'], gh: ['Ғ', 'ғ'], yo: ['Ё', 'ё'],
};

/** Pick upper/lower form according to the source character case. */
const pick = (pair: [string, string], upper: boolean) => (upper ? pair[0] : pair[1]);

function isLetter(ch: string) {
  return /[A-Za-z]/.test(ch);
}

function isVowel(ch: string) {
  return /[aeiouyIOAEIOUY]/.test(ch);
}

export function transliterate(input: string): string {
  if (!input) return input;
  // Normalise every flavour of the Uzbek modifier apostrophe to one char.
  const src = input.replace(/[ʻʼ’`´]/g, "'");
  const out: string[] = [];
  const isUpper = (ch: string) => ch === ch.toUpperCase() && ch !== ch.toLowerCase();

  for (let i = 0; i < src.length;) {
    const ch = src[i];
    const lower = ch.toLowerCase();
    const upper = isUpper(ch);
    const two = src.slice(i, i + 2).toLowerCase();
    const three = src.slice(i, i + 3).toLowerCase();
    const next = src[i + 1] ?? '';

    // letter + apostrophe letters: oʻ, gʻ, qʻ, hʼ (and yoʻ -> йў)
    if (three === "yo'") { out.push(pick(['ЙЎ', 'йў'], upper)); i += 3; continue; }
    if (next === "'") {
      if (lower === 'o') { out.push(pick(['Ў', 'ў'], upper)); i += 2; continue; }
      if (lower === 'g') { out.push(pick(['Ғ', 'ғ'], upper)); i += 2; continue; }
      if (lower === 'q') { out.push(pick(['Қ', 'қ'], upper)); i += 2; continue; }
      if (lower === 'h') { out.push(pick(['Ҳ', 'ҳ'], upper)); i += 2; continue; }
      // vowel + apostrophe + consonant -> tutel sign
      if (isVowel(lower)) {
        out.push(pick(SIMPLE[lower] ?? [ch.toUpperCase(), ch.toLowerCase()], upper));
        out.push('ъ');
        i += 2;
        continue;
      }
      out.push(pick(SIMPLE[lower] ?? [ch.toUpperCase(), ch.toLowerCase()], upper));
      i += 2;
      continue;
    }

    const digraph = DIGRAPHS[two];
    if (digraph) { out.push(pick(digraph, upper)); i += 2; continue; }

    // yod combinations: ya, yu, ye (word-initial / after vowel gets softened)
    if (lower === 'y' && /[aou]/i.test(next)) {
      const map: Record<string, [string, string]> = {
        ya: ['Я', 'я'], yu: ['Ю', 'ю'], yo: ['Ё', 'ё'],
      };
      const pair = map[two];
      if (pair) {
        const prev = src[i - 1] ?? '';
        const afterVowel = i > 0 && isVowel(prev.toLowerCase()) && /[aouy]/i.test(prev);
        out.push(pick(pair, upper));
        if (afterVowel) out.splice(out.length - 1, 0, 'ь');
        i += 2;
        continue;
      }
    }

    if (lower === 'e' && i === 0) { out.push(upper ? 'Э' : 'э'); i += 1; continue; }
    if (lower === 'e' && !isLetter(src[i - 1] ?? '')) { out.push(upper ? 'Э' : 'э'); i += 1; continue; }

    if (next === "'") { i += 1; continue; }

    const pair = SIMPLE[lower];
    if (pair) { out.push(pick(pair, upper)); i += 1; continue; }

    out.push(ch);
    i += 1;
  }

  return out.join('');
}
