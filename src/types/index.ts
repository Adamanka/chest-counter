/** Domain types shared across the app. */

export type Locale = 'ru' | 'en'

export type ThemeMode = 'light' | 'dark' | 'system'

export type GoalMetric = 'total' | 'today' | 'match' | 'type'

export interface ChestEvent {
  /** Stable unique id. */
  id: string
  /** Id of a built-in or custom chest type. */
  typeId: string
  /** Epoch milliseconds. */
  at: number
  /** Match the chest was counted in, or null when no match is active. */
  matchId: string | null
}

export interface Match {
  id: string
  startedAt: number
  /** null while the match is running. */
  endedAt: number | null
}

export interface CustomChestType {
  id: string
  name: string
  emoji: string
}

export interface Goal {
  id: string
  metric: GoalMetric
  /** Target value for the metric. */
  target: number
  /** Only used when metric === 'type'. */
  typeId: string | null
  createdAt: number
}

export interface Settings {
  theme: ThemeMode
  locale: Locale
  sound: boolean
  hotkeys: boolean
}

/** Everything that is persisted in localStorage. */
export interface PersistedData {
  version: number
  events: ChestEvent[]
  matches: Match[]
  customTypes: CustomChestType[]
  goals: Goal[]
  settings: Settings
}

export interface TypeCount {
  typeId: string
  count: number
  share: number
}

export interface DailyPoint {
  day: string
  count: number
}

export interface MatchSummary {
  id: string
  startedAt: number
  endedAt: number | null
  count: number
}

export interface Stats {
  total: number
  today: number
  currentMatch: number
  matchesPlayed: number
  averagePerMatch: number
  bestMatch: MatchSummary | null
  activeMatch: Match | null
  streakDays: number
  byType: TypeCount[]
  daily: DailyPoint[]
}
