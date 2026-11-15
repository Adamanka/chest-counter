import type { Goal, Stats } from '@/types'
import { clamp } from './id'

export interface GoalProgress {
  goal: Goal
  current: number
  target: number
  ratio: number
  done: boolean
}

export function goalProgress(goal: Goal, stats: Stats): GoalProgress {
  let current = 0
  switch (goal.metric) {
    case 'total':
      current = stats.total
      break
    case 'today':
      current = stats.today
      break
    case 'match':
      current = stats.currentMatch
      break
    case 'type':
      current =
        goal.typeId === null
          ? 0
          : (stats.byType.find((item) => item.typeId === goal.typeId)?.count ?? 0)
      break
  }
  const ratio = goal.target === 0 ? 0 : clamp(current / goal.target, 0, 1)
  return { goal, current, target: goal.target, ratio, done: current >= goal.target }
}

export function completedGoals(goals: readonly Goal[], stats: Stats): number {
  return goals.reduce((sum, goal) => (goalProgress(goal, stats).done ? sum + 1 : sum), 0)
}
