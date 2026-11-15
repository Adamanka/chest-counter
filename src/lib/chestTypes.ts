import type { CustomChestType } from '@/types'

export interface BuiltInChestType {
  id: string
  emoji: string
  color: string
  /** i18n key for the localized name. */
  nameKey: string
}

/** Built-in chest types. Ids are stable and used in persisted data. */
export const BUILT_IN_TYPES: readonly BuiltInChestType[] = [
  { id: 'common', emoji: '📦', color: '#64748b', nameKey: 'types.common' },
  { id: 'rare', emoji: '💎', color: '#2563eb', nameKey: 'types.rare' },
  { id: 'epic', emoji: '🔮', color: '#7c3aed', nameKey: 'types.epic' },
  { id: 'legendary', emoji: '👑', color: '#f59e0b', nameKey: 'types.legendary' },
  { id: 'golden', emoji: '⭐', color: '#eab308', nameKey: 'types.golden' },
  { id: 'special', emoji: '🎲', color: '#db2777', nameKey: 'types.special' },
] as const

export const BUILT_IN_IDS: readonly string[] = BUILT_IN_TYPES.map((type) => type.id)

export const DEFAULT_TYPE_ID = 'common'

export const CUSTOM_TYPE_EMOJIS = ['🎁', '🧰', '🗝️', '🏆', '🎯', '🚀', '🍀', '🔥'] as const

export const CUSTOM_TYPE_COLORS = [
  '#0ea5e9',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
] as const

export interface ResolvedChestType {
  id: string
  emoji: string
  color: string
  nameKey: string | null
  name: string | null
  isCustom: boolean
}

/** Merge built-in types with persisted custom types into one ordered list. */
export function resolveChestTypes(customTypes: readonly CustomChestType[]): ResolvedChestType[] {
  const builtIns: ResolvedChestType[] = BUILT_IN_TYPES.map((type) => ({
    id: type.id,
    emoji: type.emoji,
    color: type.color,
    nameKey: type.nameKey,
    name: null,
    isCustom: false,
  }))

  const custom: ResolvedChestType[] = customTypes.map((type, index) => ({
    id: type.id,
    emoji: type.emoji,
    color: CUSTOM_TYPE_COLORS[index % CUSTOM_TYPE_COLORS.length] ?? '#0ea5e9',
    nameKey: null,
    name: type.name,
    isCustom: true,
  }))

  return [...builtIns, ...custom]
}
