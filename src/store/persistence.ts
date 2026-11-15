import { useAppStore, selectPersistedData, type AppState } from './appStore'
import { useUiStore } from './uiStore'
import { savePersisted } from '@/lib/storage'

const DEBOUNCE_MS = 150

let timer: ReturnType<typeof setTimeout> | null = null
let started = false

function dataFingerprint(state: AppState): unknown[] {
  return [state.events, state.matches, state.customTypes, state.goals, state.settings]
}

function changed(previous: AppState, next: AppState): boolean {
  return (
    previous.events !== next.events ||
    previous.matches !== next.matches ||
    previous.customTypes !== next.customTypes ||
    previous.goals !== next.goals ||
    previous.settings !== next.settings
  )
}

function persistNow(): void {
  const { setSaveStatus, showToast } = useUiStore.getState()
  const data = selectPersistedData(useAppStore.getState())
  const result = savePersisted(data)

  if (result.ok) {
    setSaveStatus('saved')
    return
  }

  setSaveStatus('error')
  if (result.reason === 'quota' || result.reason === 'unknown') {
    const translate = useAppStore.getState().settings.locale === 'en'
    showToast(
      'error',
      translate
        ? 'Storage is full. Export your data and reset the history.'
        : 'Хранилище переполнено. Экспортируйте данные и сбросьте историю.',
    )
  }
}

export function flushPersistence(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  persistNow()
}

export function schedulePersistence(): void {
  useUiStore.getState().setSaveStatus('saving')
  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    persistNow()
  }, DEBOUNCE_MS)
}

/** Wire the store to localStorage. Safe to call more than once. */
export function startPersistence(): void {
  if (started) return
  started = true

  useAppStore.subscribe((next, previous) => {
    if (changed(previous, next)) schedulePersistence()
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flushPersistence)
    window.addEventListener('beforeunload', flushPersistence)
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPersistence()
    })
  }
}

export const __testing = { dataFingerprint }
