import { create } from 'zustand'
import type {
  ChestEvent,
  CustomChestType,
  Goal,
  GoalMetric,
  Match,
  PersistedData,
  Settings,
} from '@/types'
import { activeMatch } from '@/lib/stats'
import { createId } from '@/lib/id'
import { loadPersisted } from '@/lib/storage'
import { resolveChestTypes } from '@/lib/chestTypes'
import { applyRedo, applyUndo, pushLimited, type Snapshot, type UndoCommand } from '@/lib/undo'
import { normalizeData } from '@/schemas'

const initial = loadPersisted()

export interface GoalInput {
  metric: GoalMetric
  target: number
  typeId: string | null
}

export interface AppState extends Snapshot {
  settings: Settings
  past: UndoCommand[]
  future: UndoCommand[]
  storageStatus: 'none' | 'ok' | 'corrupted'
  storageIssues: string[]

  addChest: (typeId: string, at?: number) => void
  decrementChest: (typeId: string) => void
  deleteEvent: (id: string) => void
  startMatch: (at?: number) => void
  endMatch: (at?: number) => void
  undo: () => boolean
  redo: () => boolean
  addCustomType: (name: string, emoji: string) => void
  removeCustomType: (id: string) => void
  addGoal: (input: GoalInput) => void
  removeGoal: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  replaceData: (data: PersistedData, reason: 'import' | 'reset') => void
  resetAll: () => void
  dismissStorageIssue: () => void
}

function snapshotOf(state: Snapshot): Snapshot {
  return {
    events: state.events,
    matches: state.matches,
    customTypes: state.customTypes,
    goals: state.goals,
  }
}

export const useAppStore = create<AppState>()((set, get) => ({
  events: initial.data.events,
  matches: initial.data.matches,
  customTypes: initial.data.customTypes,
  goals: initial.data.goals,
  settings: initial.data.settings,
  past: [],
  future: [],
  storageStatus: initial.status,
  storageIssues: initial.issues,

  addChest: (typeId, at = Date.now()) => {
    const state = get()
    const knownType = resolveChestTypes(state.customTypes).some((type) => type.id === typeId)
    if (!knownType) return

    const match = activeMatch(state.matches)
    const event: ChestEvent = {
      id: createId('evt'),
      typeId,
      at,
      matchId: match?.id ?? null,
    }
    const command: UndoCommand = { kind: 'add-event', event, index: state.events.length }

    set({
      events: [...state.events, event],
      past: pushLimited(state.past, command),
      future: [],
    })
  },

  decrementChest: (typeId) => {
    const state = get()
    let index = -1
    for (let cursor = state.events.length - 1; cursor >= 0; cursor -= 1) {
      if (state.events[cursor]?.typeId === typeId) {
        index = cursor
        break
      }
    }
    const event = index === -1 ? undefined : state.events[index]
    if (!event) return

    const command: UndoCommand = { kind: 'remove-event', event, index }
    set({
      events: state.events.filter((_, position) => position !== index),
      past: pushLimited(state.past, command),
      future: [],
    })
  },

  deleteEvent: (id) => {
    const state = get()
    const index = state.events.findIndex((event) => event.id === id)
    const event = index === -1 ? undefined : state.events[index]
    if (!event) return

    const command: UndoCommand = { kind: 'remove-event', event, index }
    set({
      events: state.events.filter((item) => item.id !== id),
      past: pushLimited(state.past, command),
      future: [],
    })
  },

  startMatch: (at = Date.now()) => {
    const state = get()
    if (activeMatch(state.matches)) return

    const match: Match = { id: createId('match'), startedAt: at, endedAt: null }
    const command: UndoCommand = { kind: 'start-match', match }
    set({
      matches: [...state.matches, match],
      past: pushLimited(state.past, command),
      future: [],
    })
  },

  endMatch: (at = Date.now()) => {
    const state = get()
    const match = activeMatch(state.matches)
    if (!match) return

    const endedAt = Math.max(at, match.startedAt)
    const command: UndoCommand = { kind: 'end-match', matchId: match.id, endedAt }
    set({
      matches: state.matches.map((item) => (item.id === match.id ? { ...item, endedAt } : item)),
      past: pushLimited(state.past, command),
      future: [],
    })
  },

  undo: () => {
    const state = get()
    const command = state.past[state.past.length - 1]
    if (!command) return false

    const next = applyCommand(state, command, 'undo')
    set({
      ...next,
      past: state.past.slice(0, -1),
      future: pushLimited(state.future, command),
    })
    return true
  },

  redo: () => {
    const state = get()
    const command = state.future[state.future.length - 1]
    if (!command) return false

    const next = applyCommand(state, command, 'redo')
    set({
      ...next,
      future: state.future.slice(0, -1),
      past: pushLimited(state.past, command),
    })
    return true
  },

  addCustomType: (name, emoji) => {
    const trimmed = name.trim().slice(0, 40)
    if (trimmed === '') return
    const type: CustomChestType = {
      id: createId('type'),
      name: trimmed,
      emoji: emoji.trim() === '' ? '🎁' : emoji.trim().slice(0, 16),
    }
    const state = get()
    set({ customTypes: [...state.customTypes, type] })
  },

  removeCustomType: (id) => {
    const state = get()
    const before = snapshotOf(state)
    const after: Snapshot = {
      events: state.events.filter((event) => event.typeId !== id),
      matches: state.matches,
      customTypes: state.customTypes.filter((type) => type.id !== id),
      goals: state.goals.filter((goal) => goal.typeId !== id),
    }
    set({
      ...after,
      past: pushLimited(state.past, {
        kind: 'replace-all',
        reason: 'cleanup',
        before,
        after,
      }),
      future: [],
    })
  },

  addGoal: (input) => {
    const target = Math.round(input.target)
    if (!Number.isFinite(target) || target <= 0) return
    const state = get()
    const goal: Goal = {
      id: createId('goal'),
      metric: input.metric,
      target: Math.min(target, 1_000_000),
      typeId: input.metric === 'type' ? input.typeId : null,
      createdAt: Date.now(),
    }
    set({ goals: [...state.goals, goal] })
  },

  removeGoal: (id) => {
    set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) }))
  },

  updateSettings: (patch) => {
    set((state) => ({ settings: { ...state.settings, ...patch } }))
  },

  replaceData: (data, reason) => {
    const state = get()
    const normalized = normalizeData(data)
    const before = snapshotOf(state)
    const after: Snapshot = {
      events: normalized.events,
      matches: normalized.matches,
      customTypes: normalized.customTypes,
      goals: normalized.goals,
    }
    set({
      ...after,
      // Settings survive imports so the UI does not change unexpectedly.
      settings: state.settings,
      past: pushLimited(state.past, {
        kind: 'replace-all',
        reason,
        before,
        after,
      }),
      future: [],
    })
  },

  resetAll: () => {
    const state = get()
    const before = snapshotOf(state)
    const after: Snapshot = { events: [], matches: [], customTypes: [], goals: [] }
    set({
      ...after,
      past: pushLimited(state.past, {
        kind: 'replace-all',
        reason: 'reset',
        before,
        after,
      }),
      future: [],
    })
  },

  dismissStorageIssue: () => {
    set({ storageStatus: 'ok', storageIssues: [] })
  },
}))

type Direction = 'undo' | 'redo'

function applyCommand(state: Snapshot, command: UndoCommand, direction: Direction): Snapshot {
  return direction === 'undo' ? applyUndo(state, command) : applyRedo(state, command)
}

/** Build a serializable payload for persistence and export. */
export function selectPersistedData(state: AppState): PersistedData {
  return {
    version: 1,
    events: state.events,
    matches: state.matches,
    customTypes: state.customTypes,
    goals: state.goals,
    settings: state.settings,
  }
}
