import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

const META_COLORS = { light: '#f6f8fc', dark: '#060b15' } as const

function systemPrefersDark(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
}

export function applyThemeClass(isDark: boolean): void {
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', isDark ? META_COLORS.dark : META_COLORS.light)
}

/** Apply the stored theme and follow OS changes while "system" is selected. */
export function useTheme(): { isDark: boolean } {
  const theme = useAppStore((state) => state.settings.theme)

  useEffect(() => {
    const resolve = (): boolean => (theme === 'system' ? systemPrefersDark() : theme === 'dark')
    applyThemeClass(resolve())

    if (theme !== 'system' || typeof window.matchMedia !== 'function') return

    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => {
      applyThemeClass(resolve())
    }
    query.addEventListener('change', onChange)
    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [theme])

  const isDark = theme === 'system' ? systemPrefersDark() : theme === 'dark'
  return { isDark }
}
