import type { TranslationKey } from '@/i18n'

export const TABS = [
  { id: 'counter', labelKey: 'nav.counter', emoji: '🧰' },
  { id: 'stats', labelKey: 'nav.stats', emoji: '📊' },
  { id: 'history', labelKey: 'nav.history', emoji: '🕘' },
  { id: 'goals', labelKey: 'nav.goals', emoji: '🎯' },
  { id: 'settings', labelKey: 'nav.settings', emoji: '⚙️' },
] as const satisfies ReadonlyArray<{ id: string; labelKey: TranslationKey; emoji: string }>

export type TabId = (typeof TABS)[number]['id']

export const TAB_IDS: readonly string[] = TABS.map((tab) => tab.id)

export function isTabId(value: string): value is TabId {
  return TAB_IDS.includes(value)
}
