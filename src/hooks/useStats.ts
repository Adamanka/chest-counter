import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { computeStats } from '@/lib/stats'
import type { Stats } from '@/types'
import { useNow } from './useI18n'

/**
 * Derived statistics. Recomputes when data changes and periodically so that
 * "today", the streak and the day boundary stay accurate.
 */
export function useStats(): Stats {
  const events = useAppStore((state) => state.events)
  const matches = useAppStore((state) => state.matches)
  const customTypes = useAppStore((state) => state.customTypes)
  const now = useNow(30_000)

  return useMemo(
    () => computeStats(events, matches, customTypes, now),
    [events, matches, customTypes, now],
  )
}
