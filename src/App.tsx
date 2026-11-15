import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useUiStore } from '@/store/uiStore'
import { useI18n } from '@/hooks/useI18n'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useClickSound } from '@/hooks/useClickSound'
import { useTheme } from '@/hooks/useTheme'
import { Header } from '@/components/layout/Header'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { isTabId, type TabId } from '@/components/layout/tabs'
import { CounterPanel } from '@/components/counter/CounterPanel'
import { StatsPanel } from '@/components/stats/StatsPanel'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { GoalsPanel } from '@/components/goals/GoalsPanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { CorruptedBanner } from '@/components/CorruptedBanner'
import { Toast } from '@/components/ui/Toast'

function tabFromHash(): TabId {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return isTabId(raw) ? raw : 'counter'
}

function App() {
  useTheme()
  const { t } = useI18n()
  const [tab, setTab] = useState<TabId>(tabFromHash)

  const selectedTypeId = useUiStore((state) => state.selectedTypeId)
  const showToast = useUiStore((state) => state.showToast)
  const hotkeysEnabled = useAppStore((state) => state.settings.hotkeys)
  const addChest = useAppStore((state) => state.addChest)
  const decrementChest = useAppStore((state) => state.decrementChest)
  const undo = useAppStore((state) => state.undo)
  const redo = useAppStore((state) => state.redo)
  const playClick = useClickSound()

  useEffect(() => {
    const onHashChange = (): void => {
      setTab(tabFromHash())
    }
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  const navigate = useCallback((next: TabId) => {
    setTab(next)
    window.location.hash = `#/${next}`
  }, [])

  const handleAdd = useCallback(() => {
    addChest(selectedTypeId)
    playClick()
  }, [addChest, selectedTypeId, playClick])

  const handleRemove = useCallback(() => {
    decrementChest(selectedTypeId)
  }, [decrementChest, selectedTypeId])

  const handleUndo = useCallback(() => {
    const ok = undo()
    if (!ok) showToast('info', t('toast.nothingToUndo'))
  }, [undo, showToast, t])

  const handleRedo = useCallback(() => {
    const ok = redo()
    if (!ok) showToast('info', t('toast.nothingToRedo'))
  }, [redo, showToast, t])

  useHotkeys(hotkeysEnabled, handleAdd, handleRemove, handleUndo, handleRedo)

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only rounded-lg bg-brand-400 px-3 py-2 font-semibold text-ink-900 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
      >
        {t('app.skipToContent')}
      </a>

      <Header />
      <Nav active={tab} onChange={navigate} />

      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
        <h1 className="sr-only">{t('app.title')}</h1>
        <CorruptedBanner />
        {tab === 'counter' ? <CounterPanel /> : null}
        {tab === 'stats' ? <StatsPanel /> : null}
        {tab === 'history' ? <HistoryPanel /> : null}
        {tab === 'goals' ? <GoalsPanel /> : null}
        {tab === 'settings' ? <SettingsPanel /> : null}
      </main>

      <Footer />
      <Toast />
    </div>
  )
}

export default App
