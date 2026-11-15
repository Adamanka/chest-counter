import type { TranslationKey } from '@/i18n'
import type { ResolvedChestType } from '@/lib/chestTypes'
import { useI18n } from './useI18n'

/** Resolve the display name of a built-in or custom chest type. */
export function useTypeName(): (type: ResolvedChestType) => string {
  const { t } = useI18n()
  return (type) => {
    if (type.name !== null) return type.name
    if (type.nameKey !== null) return t(type.nameKey as TranslationKey)
    return type.id
  }
}
