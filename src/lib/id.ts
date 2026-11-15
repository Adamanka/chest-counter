/** Small helpers with no dependencies. */

/**
 * Generate a unique id without relying on crypto.randomUUID being available
 * (it is not in older Safari and in some test environments).
 */
export function createId(prefix = 'id'): string {
  const { crypto: cryptoObject } = globalThis as { crypto?: Crypto }
  if (typeof cryptoObject?.randomUUID === 'function') {
    return `${prefix}_${cryptoObject.randomUUID()}`
  }
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now().toString(36)}_${random}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
