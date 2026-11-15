import type { ChestEvent } from '@/types'
import { createId } from './id'

export interface CsvRow {
  id: string
  typeId: string
  typeName: string
  at: number
  iso: string
  matchId: string
}

export interface CsvParseResult {
  ok: boolean
  events: ChestEvent[]
  error: 'empty' | 'header' | 'rows' | null
  skipped: number
}

const HEADER = ['id', 'typeId', 'typeName', 'at', 'iso', 'matchId'] as const

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

/** Serialize events to CSV (RFC 4180 style, CRLF line endings). */
export function buildCsv(
  events: readonly ChestEvent[],
  typeNames: ReadonlyMap<string, string>,
): string {
  const lines: string[] = [HEADER.join(',')]
  const sorted = [...events].sort((a, b) => a.at - b.at)
  for (const event of sorted) {
    const row: CsvRow = {
      id: event.id,
      typeId: event.typeId,
      typeName: typeNames.get(event.typeId) ?? event.typeId,
      at: event.at,
      iso: new Date(event.at).toISOString(),
      matchId: event.matchId ?? '',
    }
    lines.push(
      [
        escapeCell(row.id),
        escapeCell(row.typeId),
        escapeCell(row.typeName),
        String(row.at),
        escapeCell(row.iso),
        escapeCell(row.matchId),
      ].join(','),
    )
  }
  return `${lines.join('\r\n')}\r\n`
}

/** Split a CSV document into rows of cells, honouring quoted fields. */
export function splitCsv(text: string): string[][] {
  const clean = text
    .replace(/^\uFEFF/, '')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index]

    if (quoted) {
      if (char === '"') {
        if (clean[index + 1] === '"') {
          cell += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        cell += char ?? ''
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char ?? ''
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((value) => value.trim() !== ''))
}

function headerIndex(header: readonly string[], name: string): number {
  return header.findIndex((cell) => cell.trim().toLowerCase() === name.toLowerCase())
}

/**
 * Parse a CSV import. Accepts the app's own export and simple files that only
 * contain `typeId,at` columns.
 */
export function parseCsv(text: string): CsvParseResult {
  const rows = splitCsv(text)
  if (rows.length === 0) return { ok: false, events: [], error: 'empty', skipped: 0 }

  const header = rows[0]
  if (!header) return { ok: false, events: [], error: 'empty', skipped: 0 }

  const typeIndex = headerIndex(header, 'typeId')
  const atIndex = headerIndex(header, 'at')
  const idIndex = headerIndex(header, 'id')
  const matchIndex = headerIndex(header, 'matchId')
  const isoIndex = headerIndex(header, 'iso')

  if (typeIndex === -1 || (atIndex === -1 && isoIndex === -1)) {
    return { ok: false, events: [], error: 'header', skipped: 0 }
  }

  const events: ChestEvent[] = []
  let skipped = 0

  for (const row of rows.slice(1)) {
    const typeId = row[typeIndex]?.trim() ?? ''
    const rawAt = atIndex === -1 ? '' : (row[atIndex]?.trim() ?? '')
    const rawIso = isoIndex === -1 ? '' : (row[isoIndex]?.trim() ?? '')

    let at = Number(rawAt)
    if (!Number.isFinite(at) && rawIso !== '') {
      at = Date.parse(rawIso)
    }
    if (!Number.isFinite(at) || at <= 0) {
      at = rawIso !== '' ? Date.parse(rawIso) : Number.NaN
    }

    if (typeId === '' || !Number.isFinite(at) || at <= 0) {
      skipped += 1
      continue
    }

    const id = (idIndex === -1 ? '' : (row[idIndex]?.trim() ?? '')) || createId('evt')
    const rawMatch = matchIndex === -1 ? '' : (row[matchIndex]?.trim() ?? '')

    events.push({
      id,
      typeId,
      at: Math.trunc(at),
      matchId: rawMatch === '' ? null : rawMatch,
    })
  }

  if (events.length === 0) {
    return { ok: false, events: [], error: 'rows', skipped }
  }

  return { ok: true, events, error: null, skipped }
}
