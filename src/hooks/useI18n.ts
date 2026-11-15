import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { createTranslator } from '@/i18n'
import type { Locale } from '@/types'

/** A ticking timestamp. Default: once per second (match timer, day rollover). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now())
    }, intervalMs)
    return () => {
      window.clearInterval(id)
    }
  }, [intervalMs])

  return now
}

export function useI18n() {
  const locale = useAppStore((state) => state.settings.locale)
  const updateSettings = useAppStore((state) => state.updateSettings)

  const t = useMemo(() => createTranslator(locale), [locale])

  return {
    t,
    locale,
    setLocale: (next: Locale) => {
      updateSettings({ locale: next })
      document.documentElement.lang = next
    },
  }
}
