import type { ChestEvent, DailyPoint, Match, MatchSummary, Stats, TypeCount } from '@/types'
import { dayKey, lastDays } from './time'
import { resolveChestTypes } from './chestTypes'
import type { CustomChestType } from '@/types'

export const DAILY_WINDOW = 14

export function activeMatch(matches: readonly Match[]): Match | null {
  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const match = matches[index]
    if (match && match.endedAt === null) return match
  }
  return null
}

export function countByType(events: readonly ChestEvent[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const event of events) {
    counts.set(event.typeId, (counts.get(event.typeId) ?? 0) + 1)
  }
  return counts
}

export function countInMatch(events: readonly ChestEvent[], matchId: string | null): number {
  if (matchId === null) return 0
  return events.reduce((total, event) => (event.matchId === matchId ? total + 1 : total), 0)
}

export function countToday(events: readonly ChestEvent[], now: number): number {
  const today = dayKey(now)
  return events.reduce((total, event) => (dayKey(event.at) === today ? total + 1 : total), 0)
}

export function summarizeMatches(
  events: readonly ChestEvent[],
  matches: readonly Match[],
): MatchSummary[] {
  const perMatch = new Map<string, number>()
  for (const event of events) {
    if (event.matchId === null) continue
    perMatch.set(event.matchId, (perMatch.get(event.matchId) ?? 0) + 1)
  }
  return matches.map((match) => ({
    id: match.id,
    startedAt: match.startedAt,
    endedAt: match.endedAt,
    count: perMatch.get(match.id) ?? 0,
  }))
}

export function bestMatchOf(summaries: readonly MatchSummary[]): MatchSummary | null {
  let best: MatchSummary | null = null
  for (const summary of summaries) {
    if (best === null || summary.count > best.count) best = summary
  }
  return best
}

/** Consecutive days with at least one chest, counted back from today (or yesterday). */
export function streakDays(events: readonly ChestEvent[], now: number): number {
  if (events.length === 0) return 0

  const days = new Set(events.map((event) => dayKey(event.at)))
  let cursor = now
  if (!days.has(dayKey(cursor))) {
    const yesterday = cursor - 86_400_000
    if (!days.has(dayKey(yesterday))) return 0
    cursor = yesterday
  }

  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor -= 86_400_000
  }
  return streak
}

export function dailySeries(
  events: readonly ChestEvent[],
  now: number,
  window = DAILY_WINDOW,
): DailyPoint[] {
  const buckets = new Map<string, number>()
  for (const event of events) {
    const key = dayKey(event.at)
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }
  return lastDays(window, now).map((day) => ({ day, count: buckets.get(day) ?? 0 }))
}

export function computeStats(
  events: readonly ChestEvent[],
  matches: readonly Match[],
  customTypes: readonly CustomChestType[],
  now: number,
): Stats {
  const counts = countByType(events)
  const total = events.length
  const resolvedTypes = resolveChestTypes(customTypes)
  const byType: TypeCount[] = resolvedTypes.map((type) => {
    const count = counts.get(type.id) ?? 0
    return {
      typeId: type.id,
      count,
      share: total === 0 ? 0 : count / total,
    }
  })

  const summaries = summarizeMatches(events, matches)
  const inMatches = summaries.reduce((sum, summary) => sum + summary.count, 0)
  const current = activeMatch(matches)
  const best = bestMatchOf(summaries)

  return {
    total,
    today: countToday(events, now),
    currentMatch: countInMatch(events, current?.id ?? null),
    matchesPlayed: matches.length,
    averagePerMatch: matches.length === 0 ? 0 : inMatches / matches.length,
    bestMatch: best,
    activeMatch: current,
    streakDays: streakDays(events, now),
    byType,
    daily: dailySeries(events, now),
  }
}
