import type { TelegramSettings } from '@/features/settings/types';

/**
 * Mock tenant wiring — matches the production routing: one forum supergroup,
 * the bot as admin, IN/OUT/UNKNOWN events fanned out by thread id.
 */
export const DEFAULT_TELEGRAM: TelegramSettings = {
  enabled: true,
  chatId: '-1001234567890',
  connected: true,
  lastCheckedMinutes: 3,
  topics: [
    { id: 'tp-in', rule: 'in', name: "Keldi", threadId: '41', active: true },
    { id: 'tp-out', rule: 'out', name: "Ketdi", threadId: '42', active: true },
    { id: 'tp-unk', rule: 'unknown', name: "Begona odamlar", threadId: '43', active: true },
    { id: 'tp-sys', rule: 'system', name: 'Tizim xabarlari', threadId: '', active: false }
  ]
};
