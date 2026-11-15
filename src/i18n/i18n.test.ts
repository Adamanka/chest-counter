import { describe, expect, it } from 'vitest'
import { BUILT_IN_TYPES } from '@/lib/chestTypes'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { createTranslator, enTranslations, ruTranslations } from './index'

describe('i18n dictionaries', () => {
  it('cover every built-in chest type name in both locales', () => {
    for (const type of BUILT_IN_TYPES) {
      expect(ruTranslations, `ru: ${type.nameKey}`).toHaveProperty([type.nameKey])
      expect(enTranslations, `en: ${type.nameKey}`).toHaveProperty([type.nameKey])
    }
  })

  it('cover every achievement title and description in both locales', () => {
    for (const achievement of ACHIEVEMENTS) {
      expect(ruTranslations, `ru: ${achievement.titleKey}`).toHaveProperty([achievement.titleKey])
      expect(ruTranslations, `ru: ${achievement.descriptionKey}`).toHaveProperty([
        achievement.descriptionKey,
      ])
      expect(enTranslations, `en: ${achievement.titleKey}`).toHaveProperty([achievement.titleKey])
      expect(enTranslations, `en: ${achievement.descriptionKey}`).toHaveProperty([
        achievement.descriptionKey,
      ])
    }
  })

  it('have the same keys in Russian and English', () => {
    const ruKeys = Object.keys(ruTranslations).sort()
    const enKeys = Object.keys(enTranslations).sort()
    expect(enKeys).toEqual(ruKeys)
  })

  it('interpolate variables and leave unknown placeholders untouched', () => {
    const t = createTranslator('ru')
    expect(t('history.hidden', { count: 50 })).toBe('Показаны последние 50 записей.')
    expect(t('history.hidden', { other: 1 })).toBe('Показаны последние {count} записей.')
  })
})
