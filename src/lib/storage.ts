import type { PersistedData } from '@/types'
import { CORRUPTED_KEY, STORAGE_KEY, emptyData, parsePersisted } from '@/schemas'

export interface LoadResult {
  data: PersistedData
  /** 'none' = first visit, 'ok' = loaded, 'corrupted' = could not parse. */
  status: 'none' | 'ok' | 'corrupted'
  issues: string[]
}

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' | 'unknown' }

function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

export function isStorageAvailable(): boolean {
  const storage = getStorage()
  if (!storage) return false
  try {
    const probe = '__cc_probe__'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function loadPersisted(): LoadResult {
  const storage = getStorage()
  if (!storage) {
    return { data: emptyData(), status: 'none', issues: ['storage-unavailable'] }
  }

  let raw: string | null = null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { data: emptyData(), status: 'corrupted', issues: ['storage-read-failed'] }
  }

  if (raw === null || raw === '') {
    return { data: emptyData(), status: 'none', issues: [] }
  }

  const parsed = parsePersisted(raw)
  if (!parsed.ok) {
    // Keep the broken payload so the user can still download it before resetting.
    try {
      storage.setItem(CORRUPTED_KEY, raw)
    } catch {
      // Ignore: the backup is best-effort.
    }
    return { data: emptyData(), status: 'corrupted', issues: parsed.issues }
  }

  return { data: parsed.value, status: 'ok', issues: [] }
}

export function savePersisted(data: PersistedData): SaveResult {
  const storage = getStorage()
  if (!storage) return { ok: false, reason: 'unavailable' }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return { ok: false, reason: isQuota ? 'quota' : 'unknown' }
  }
}

export function readCorruptedBackup(): string | null {
  const storage = getStorage()
  if (!storage) return null
  try {
    return storage.getItem(CORRUPTED_KEY)
  } catch {
    return null
  }
}

export function clearPersisted(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(CORRUPTED_KEY)
  } catch {
    // Nothing useful to do when storage is blocked.
  }
}
