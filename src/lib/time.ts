/** Local-date helpers. All day boundaries use the browser's local time zone. */

export function pad2(value: number): string {
  return value < 10 ? `0${String(value)}` : String(value)
}

/** Local calendar day key, e.g. `2026-11-15`. */
export function dayKey(timestamp: number): string {
  const date = new Date(timestamp)
  return `${String(date.getFullYear())}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function addDays(timestamp: number, days: number): number {
  const date = new Date(timestamp)
  date.setDate(date.getDate() + days)
  return date.getTime()
}

/** Last `count` local day keys, oldest first, ending today. */
export function lastDays(count: number, now: number): string[] {
  const days: string[] = []
  for (let index = count - 1; index >= 0; index -= 1) {
    days.push(dayKey(addDays(now, -index)))
  }
  return days
}

export function formatTime(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatDateTime(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(from: number, to: number): string {
  const totalSeconds = Math.max(0, Math.round((to - from) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${String(hours)}:${pad2(minutes)}:${pad2(seconds)}`
  return `${String(minutes)}:${pad2(seconds)}`
}

/** Ticking clock label (mm:ss). */
export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${pad2(minutes)}:${pad2(seconds)}`
}
