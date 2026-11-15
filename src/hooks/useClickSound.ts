import { useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { playClickSound } from '@/lib/sound'

/** Returns a function that plays the click only when sound is enabled. */
export function useClickSound(): () => void {
  const soundEnabled = useAppStore((state) => state.settings.sound)

  return useCallback(() => {
    if (soundEnabled) playClickSound()
  }, [soundEnabled])
}
