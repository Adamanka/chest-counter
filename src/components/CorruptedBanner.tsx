import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useUiStore } from '@/store/uiStore'
import { useI18n } from '@/hooks/useI18n'
import { clearPersisted, readCorruptedBackup } from '@/lib/storage'
import { downloadTextFile } from '@/lib/exportImport'
import { Button } from '@/components/ui/Button'

/** Shown when localStorage held data that could not be validated. */
export function CorruptedBanner() {
  const { t } = useI18n()
  const status = useAppStore((state) => state.storageStatus)
  const issues = useAppStore((state) => state.storageIssues)
  const dismiss = useAppStore((state) => state.dismissStorageIssue)
  const showToast = useUiStore((state) => state.showToast)
  const [expanded, setExpanded] = useState(false)

  if (status !== 'corrupted') return null

  const handleDownload = (): void => {
    const raw = readCorruptedBackup()
    if (!raw) {
      showToast('error', t('toast.saveFailed'))
      return
    }
    downloadTextFile('chest-counter-corrupted.json', 'application/json', raw)
  }

  return (
    <div
      role="alert"
      className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-700/70 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <h2 className="text-base font-bold">⚠️ {t('error.corrupted.title')}</h2>
      <p className="mt-1 text-sm">{t('error.corrupted.body')}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={handleDownload}>
          {t('error.corrupted.download')}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            clearPersisted()
            dismiss()
            showToast('info', t('toast.resetDone'))
          }}
        >
          {t('error.corrupted.reset')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setExpanded(!expanded)
          }}
          aria-expanded={expanded}
        >
          {t('error.corrupted.issues')}
        </Button>
      </div>

      {expanded ? (
        <ul className="mt-2 list-inside list-disc text-xs">
          {issues.length === 0 ? (
            <li>{t('import.error.invalid-shape')}</li>
          ) : (
            issues.map((issue) => <li key={issue}>{issue}</li>)
          )}
        </ul>
      ) : null}
    </div>
  )
}
