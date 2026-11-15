import { z } from 'zod'
import type { ChestEvent, CustomChestType, Goal, Match, PersistedData, Settings } from '@/types'

export const STORAGE_KEY = 'chest-counter:v1'
export const CORRUPTED_KEY = 'chest-counter:v1:corrupted'
export const APP_ID = 'chest-counter'
export const DATA_VERSION = 1

const MAX_STRING = 200
const MAX_EVENTS = 200_000

export const chestEventSchema = z.object({
  id: z.string().min(1).max(MAX_STRING),
  typeId: z.string().min(1).max(MAX_STRING),
  at: z.number().int().positive(),
  matchId: z.string().min(1).max(MAX_STRING).nullable(),
})

export const matchSchema = z.object({
  id: z.string().min(1).max(MAX_STRING),
  startedAt: z.number().int().positive(),
  endedAt: z.number().int().positive().nullable(),
})

export const customTypeSchema = z.object({
  id: z.string().min(1).max(MAX_STRING),
  name: z.string().trim().min(1).max(40),
  emoji: z.string().min(1).max(16),
})

export const goalSchema = z.object({
  id: z.string().min(1).max(MAX_STRING),
  metric: z.enum(['total', 'today', 'match', 'type']),
  target: z.number().int().positive().max(1_000_000),
  typeId: z.string().min(1).max(MAX_STRING).nullable(),
  createdAt: z.number().int().positive(),
})

export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).catch('system'),
  locale: z.enum(['ru', 'en']).catch('ru'),
  sound: z.boolean().catch(false),
  hotkeys: z.boolean().catch(true),
})

export const persistedDataSchema = z.object({
  version: z.number().int().nonnegative(),
  events: z.array(chestEventSchema).max(MAX_EVENTS),
  matches: z.array(matchSchema).max(MAX_EVENTS),
  customTypes: z.array(customTypeSchema).max(100),
  goals: z.array(goalSchema).max(200),
  settings: settingsSchema,
})

/** File format used by the JSON export/import. */
export const exportEnvelopeSchema = z.object({
  app: z.literal(APP_ID),
  version: z.number().int().nonnegative(),
  exportedAt: z.string().optional(),
  data: persistedDataSchema,
})

export type ExportEnvelope = z.infer<typeof exportEnvelopeSchema>

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  locale: 'ru',
  sound: false,
  hotkeys: true,
}

export function emptyData(): PersistedData {
  return {
    version: DATA_VERSION,
    events: [],
    matches: [],
    customTypes: [],
    goals: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string; issues: string[] }

function issuesOf(error: z.ZodError): string[] {
  return error.issues.slice(0, 8).map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
    return `${path}: ${issue.message}`
  })
}

/** Parse a persisted payload (localStorage string). Never throws. */
export function parsePersisted(raw: string): ParseResult<PersistedData> {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'invalid-json', issues: [] }
  }

  const result = persistedDataSchema.safeParse(json)
  if (!result.success) {
    return { ok: false, error: 'invalid-shape', issues: issuesOf(result.error) }
  }

  return { ok: true, value: normalizeData(result.data) }
}

/** Parse an imported JSON document: accepts an envelope or a bare payload. */
export function parseImportJson(raw: string): ParseResult<PersistedData> {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'invalid-json', issues: [] }
  }

  const envelope = exportEnvelopeSchema.safeParse(json)
  if (envelope.success) {
    return { ok: true, value: normalizeData(envelope.data.data) }
  }

  const bare = persistedDataSchema.safeParse(json)
  if (bare.success) {
    return { ok: true, value: normalizeData(bare.data) }
  }

  return { ok: false, error: 'invalid-shape', issues: issuesOf(bare.error) }
}

/**
 * Keep only data that can be rendered: drop events that point at an unknown
 * chest type, and drop matches referenced by nothing while ending running ones
 * is not required. Duplicate ids are removed as well.
 */
export function normalizeData(data: PersistedData): PersistedData {
  const customIds = new Set(data.customTypes.map((type) => type.id))
  const knownTypeIds = new Set<string>([
    'common',
    'rare',
    'epic',
    'legendary',
    'golden',
    'special',
    ...customIds,
  ])

  const seenEventIds = new Set<string>()
  const events: ChestEvent[] = []
  for (const event of data.events) {
    if (seenEventIds.has(event.id)) continue
    if (!knownTypeIds.has(event.typeId)) continue
    seenEventIds.add(event.id)
    events.push(event)
  }

  const seenMatchIds = new Set<string>()
  const matches: Match[] = []
  for (const match of data.matches) {
    if (seenMatchIds.has(match.id)) continue
    seenMatchIds.add(match.id)
    matches.push(match)
  }

  const knownMatchIds = new Set(matches.map((match) => match.id))
  const cleanedEvents = events.map((event) =>
    event.matchId !== null && !knownMatchIds.has(event.matchId)
      ? { ...event, matchId: null }
      : event,
  )

  const seenGoalIds = new Set<string>()
  const goals: Goal[] = []
  for (const goal of data.goals) {
    if (seenGoalIds.has(goal.id)) continue
    if (goal.metric === 'type' && (goal.typeId === null || !knownTypeIds.has(goal.typeId))) continue
    seenGoalIds.add(goal.id)
    goals.push(goal)
  }

  const customTypes: CustomChestType[] = data.customTypes.map((type) => ({ ...type }))

  return {
    version: DATA_VERSION,
    events: cleanedEvents,
    matches,
    customTypes,
    goals,
    settings: { ...data.settings },
  }
}
