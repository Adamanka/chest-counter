import type { ChestEvent, CustomChestType, Goal, Match } from '@/types'

export interface Snapshot {
  events: ChestEvent[]
  matches: Match[]
  customTypes: CustomChestType[]
  goals: Goal[]
}

export type UndoCommand =
  | { kind: 'add-event'; event: ChestEvent; index: number }
  | { kind: 'remove-event'; event: ChestEvent; index: number }
  | { kind: 'start-match'; match: Match }
  | { kind: 'end-match'; matchId: string; endedAt: number }
  | {
      kind: 'replace-all'
      reason: 'import' | 'reset' | 'cleanup'
      before: Snapshot
      after: Snapshot
    }

export const UNDO_LIMIT = 100

export function pushLimited<T>(stack: readonly T[], item: T, limit = UNDO_LIMIT): T[] {
  const next = [...stack, item]
  return next.length > limit ? next.slice(next.length - limit) : next
}

function insertAt<T>(items: readonly T[], index: number, item: T): T[] {
  const next = [...items]
  const safeIndex = Math.max(0, Math.min(index, next.length))
  next.splice(safeIndex, 0, item)
  return next
}

function removeById<T extends { id: string }>(items: readonly T[], id: string): T[] {
  return items.filter((item) => item.id !== id)
}

/** Apply the inverse of a command. Pure: returns new arrays. */
export function applyUndo(state: Snapshot, command: UndoCommand): Snapshot {
  switch (command.kind) {
    case 'add-event':
      return { ...state, events: removeById(state.events, command.event.id) }
    case 'remove-event':
      return { ...state, events: insertAt(state.events, command.index, command.event) }
    case 'start-match':
      return {
        ...state,
        events: state.events.map((event) =>
          event.matchId === command.match.id ? { ...event, matchId: null } : event,
        ),
        matches: removeById(state.matches, command.match.id),
      }
    case 'end-match':
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === command.matchId ? { ...match, endedAt: null } : match,
        ),
      }
    case 'replace-all':
      return { ...command.before }
  }
}

/** Re-apply a command after it was undone. Pure: returns new arrays. */
export function applyRedo(state: Snapshot, command: UndoCommand): Snapshot {
  switch (command.kind) {
    case 'add-event':
      return { ...state, events: insertAt(state.events, command.index, command.event) }
    case 'remove-event':
      return { ...state, events: removeById(state.events, command.event.id) }
    case 'start-match':
      return { ...state, matches: insertAt(state.matches, state.matches.length, command.match) }
    case 'end-match':
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === command.matchId ? { ...match, endedAt: command.endedAt } : match,
        ),
      }
    case 'replace-all':
      return { ...command.after }
  }
}
