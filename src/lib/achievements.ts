import type { Stats } from '@/types'
import type { TranslationKey } from '@/i18n'
import { clamp } from './id'

export interface AchievementContext {
  stats: Stats
  completedGoals: number
}

export interface AchievementDefinition {
  id: string
  emoji: string
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  target: number
  value: (context: AchievementContext) => number
}

export interface Achievement extends AchievementDefinition {
  current: number
  ratio: number
  unlocked: boolean
}

const BUILT_IN_TYPE_COUNT = 6

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'first-chest',
    emoji: '🎉',
    titleKey: 'achievements.firstChest.title',
    descriptionKey: 'achievements.firstChest.description',
    target: 1,
    value: (context) => context.stats.total,
  },
  {
    id: 'hundred',
    emoji: '💯',
    titleKey: 'achievements.hundred.title',
    descriptionKey: 'achievements.hundred.description',
    target: 100,
    value: (context) => context.stats.total,
  },
  {
    id: 'thousand',
    emoji: '🏅',
    titleKey: 'achievements.thousand.title',
    descriptionKey: 'achievements.thousand.description',
    target: 1000,
    value: (context) => context.stats.total,
  },
  {
    id: 'ten-thousand',
    emoji: '🚀',
    titleKey: 'achievements.tenThousand.title',
    descriptionKey: 'achievements.tenThousand.description',
    target: 10_000,
    value: (context) => context.stats.total,
  },
  {
    id: 'collector',
    emoji: '🧩',
    titleKey: 'achievements.collector.title',
    descriptionKey: 'achievements.collector.description',
    target: BUILT_IN_TYPE_COUNT,
    value: (context) =>
      context.stats.byType.filter((item) => item.count > 0 && item.typeId !== '').length,
  },
  {
    id: 'marathon',
    emoji: '🔥',
    titleKey: 'achievements.marathon.title',
    descriptionKey: 'achievements.marathon.description',
    target: 25,
    value: (context) => context.stats.bestMatch?.count ?? 0,
  },
  {
    id: 'week-streak',
    emoji: '📅',
    titleKey: 'achievements.weekStreak.title',
    descriptionKey: 'achievements.weekStreak.description',
    target: 7,
    value: (context) => context.stats.streakDays,
  },
  {
    id: 'goal-setter',
    emoji: '🎯',
    titleKey: 'achievements.goalSetter.title',
    descriptionKey: 'achievements.goalSetter.description',
    target: 1,
    value: (context) => context.completedGoals,
  },
] as const

export function evaluateAchievements(context: AchievementContext): Achievement[] {
  return ACHIEVEMENTS.map((definition) => {
    const current = definition.value(context)
    const ratio = definition.target <= 0 ? 1 : clamp(current / definition.target, 0, 1)
    return {
      ...definition,
      current,
      ratio,
      unlocked: current >= definition.target,
    }
  })
}
