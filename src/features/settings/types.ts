/** Which kind of event a topic receives. Mirrors the backend TopicRouter. */
export type TopicRule = 'in' | 'out' | 'unknown' | 'system';

export interface TelegramTopic {
  id: string;
  rule: TopicRule;
  /** Topic title as typed in the Telegram group — an Uzbek literal, translate via g(). */
  name: string;
  /** Forum thread_id as shown by the group; empty = not filled yet. */
  threadId: string;
  active: boolean;
}

export interface TelegramSettings {
  /** Master switch — off means nothing is sent at all. */
  enabled: boolean;
  /** Supergroup chat id, e.g. -1001234567890. */
  chatId: string;
  topics: TelegramTopic[];
  /** Bot is admin in the group and answers. */
  connected: boolean;
  lastCheckedMinutes: number;
}
