import uz from '@/messages/uz.json';
import uzCyrl from '@/messages/uz-Cyrl.json';
import ru from '@/messages/ru.json';
import en from '@/messages/en.json';
import type { Locale } from './config';

export type Dictionary = typeof uz;

/**
 * Every language is bundled up front: the dictionaries are a few dozen kilobytes, and switching
 * a language must repaint instantly instead of fetching anything.
 */
export const messages: Record<Locale, Dictionary> = {
  uz,
  'uz-Cyrl': uzCyrl as Dictionary,
  ru: ru as Dictionary,
  en: en as Dictionary
};
