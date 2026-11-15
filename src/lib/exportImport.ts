import type { ChestEvent, CustomChestType, PersistedData, Settings } from '@/types'
import {
  APP_ID,
  DATA_VERSION,
  type ExportEnvelope,
  normalizeData,
  parseImportJson,
} from '@/schemas'
import { buildCsv, parseCsv } from './csv'
import { resolveChestTypes } from './chestTypes'
import { createId } from './id'

export function buildTypeNameMap(customTypes: readonly CustomChestType[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const type of resolveChestTypes(customTypes)) {
    map.set(type.id, type.name ?? type.nameKey ?? type.id)
  }
  return map
}

export function buildEnvelope(data: PersistedData): ExportEnvelope {
  return {
    app: APP_ID,
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      ...data,
      version: DATA_VERSION,
    },
  }
}

export function toJsonExport(data: PersistedData): string {
  return `${JSON.stringify(buildEnvelope(data), null, 2)}\n`
}

export function toCsvExport(data: PersistedData): string {
  return buildCsv(data.events, buildTypeNameMap(data.customTypes))
}

export interface ImportSummary {
  data: PersistedData
  skipped: number
  createdTypes: string[]
}

export type ImportResult = { ok: true; value: ImportSummary } | { ok: false; error: string }

/** Import a JSON export. Settings from the current session are preserved. */
export function importFromJson(text: string, current: PersistedData): ImportResult {
  const parsed = parseImportJson(text)
  if (!parsed.ok) {
    const detail = parsed.issues.length > 0 ? ` (${parsed.issues.join('; ')})` : ''
    return { ok: false, error: `${parsed.error}${detail}` }
  }
  return {
    ok: true,
    value: {
      data: { ...parsed.value, settings: { ...current.settings } },
      skipped: 0,
      createdTypes: [],
    },
  }
}

/**
 * Import CSV. Unknown type ids become custom types named after the id so no
 * counted chest is silently lost.
 */
export function importFromCsv(
  text: string,
  current: PersistedData,
  settings: Settings,
): ImportResult {
  const parsed = parseCsv(text)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error ?? 'rows' }
  }

  const builtInIds = new Set(resolveChestTypes([]).map((type) => type.id))
  const existing = new Set(current.customTypes.map((type) => type.id))
  const created: CustomChestType[] = []

  for (const event of parsed.events) {
    if (builtInIds.has(event.typeId) || existing.has(event.typeId)) continue
    existing.add(event.typeId)
    created.push({
      id: event.typeId,
      name: event.typeId.slice(0, 40),
      emoji: '🎁',
    })
  }

  const data: PersistedData = {
    version: DATA_VERSION,
    events: parsed.events,
    matches: [],
    customTypes: [...current.customTypes, ...created],
    goals: [],
    settings: { ...settings },
  }

  return {
    ok: true,
    value: {
      data: normalizeData(data),
      skipped: parsed.skipped,
      createdTypes: created.map((type) => type.name),
    },
  }
}

export function summarizeEvents(events: readonly ChestEvent[]): string {
  return events.length === 1 ? '1 chest' : `${String(events.length)} chests`
}

export function suggestedFileName(extension: 'json' | 'csv', now = new Date()): string {
  const date = now.toISOString().slice(0, 10)
  return `chest-counter-${date}.${extension}`
}

/** Trigger a file download in the browser. Not used in tests. */
export function downloadTextFile(fileName: string, mime: string, text: string): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function createGoalId(): string {
  return createId('goal')
}
