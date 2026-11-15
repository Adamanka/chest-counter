import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useAppStore } from '@/store/appStore'
import { DATA_VERSION } from '@/schemas'
import type { PersistedData } from '@/types'
import { useUiStore } from '@/store/uiStore'
import { useI18n } from '@/hooks/useI18n'
import {
  downloadTextFile,
  importFromCsv,
  importFromJson,
  suggestedFileName,
  toCsvExport,
  toJsonExport,
} from '@/lib/exportImport'
import { clearPersisted } from '@/lib/storage'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { TranslationKey } from '@/i18n'

function errorKey(code: string): TranslationKey {
  const base = code.split(' ')[0] ?? code
  switch (base) {
    case 'invalid-json':
      return 'import.error.invalid-json'
    case 'invalid-shape':
      return 'import.error.invalid-shape'
    case 'empty':
      return 'import.error.empty'
    case 'header':
      return 'import.error.header'
    default:
      return 'import.error.rows'
  }
}

export function DataPanel() {
  const { t, locale } = useI18n()
  const events = useAppStore((state) => state.events)
  const matches = useAppStore((state) => state.matches)
  const customTypes = useAppStore((state) => state.customTypes)
  const goals = useAppStore((state) => state.goals)
  const settings = useAppStore((state) => state.settings)
  const replaceData = useAppStore((state) => state.replaceData)
  const resetAll = useAppStore((state) => state.resetAll)
  const showToast = useUiStore((state) => state.showToast)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Zustand selectors must return stable references: build the payload here
  // instead of selecting a freshly created object on every render.
  const data = useMemo<PersistedData>(
    () => ({ version: DATA_VERSION, events, matches, customTypes, goals, settings }),
    [events, matches, customTypes, goals, settings],
  )

  const sizeKb = useMemo(() => {
    const json = JSON.stringify(data)
    return Math.max(1, Math.round(json.length / 1024))
  }, [data])

  const handleExportJson = (): void => {
    downloadTextFile(suggestedFileName('json'), 'application/json', toJsonExport(data))
    showToast('success', t('toast.exportedJson'))
  }

  const handleExportCsv = (): void => {
    downloadTextFile(suggestedFileName('csv'), 'text/csv', toCsvExport(data))
    showToast('success', t('toast.exportedCsv'))
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const text = await file.text()
    const isCsv = file.name.toLowerCase().endsWith('.csv')
    const result = isCsv ? importFromCsv(text, data, data.settings) : importFromJson(text, data)

    if (!result.ok) {
      showToast('error', t('toast.importError', { reason: t(errorKey(result.error)) }))
      return
    }

    replaceData(result.value.data, 'import')

    if (result.value.skipped > 0) {
      showToast(
        'success',
        t('toast.importedSkipped', {
          count: result.value.data.events.length.toLocaleString(locale),
          skipped: result.value.skipped,
        }),
      )
    } else {
      showToast(
        'success',
        t('toast.imported', {
          count: result.value.data.events.length.toLocaleString(locale),
        }),
      )
    }

    if (result.value.createdTypes.length > 0) {
      showToast(
        'info',
        t('toast.importCreatedTypes', { types: result.value.createdTypes.join(', ') }),
      )
    }
  }

  const handleReset = (): void => {
    resetAll()
    clearPersisted()
    setConfirmOpen(false)
    showToast('info', t('toast.resetDone'))
  }

  return (
    <div>
      <h3 className="text-base font-semibold">{t('settings.data')}</h3>
      <p className="muted mt-1 text-sm">{t('settings.dataHint')}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleExportJson} data-testid="export-json">
          ⬇ {t('settings.exportJson')}
        </Button>
        <Button variant="secondary" onClick={handleExportCsv} data-testid="export-csv">
          ⬇ {t('settings.exportCsv')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          data-testid="import-open"
        >
          ⬆ {t('settings.import')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="sr-only"
          onChange={(event) => {
            void handleFile(event)
          }}
          data-testid="import-input"
          aria-label={t('settings.import')}
        />
        <Button
          variant="danger"
          onClick={() => {
            setConfirmOpen(true)
          }}
          data-testid="reset-open"
        >
          {t('settings.reset')}
        </Button>
      </div>

      <p className="muted mt-2 text-xs">{t('settings.importHint')}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-lg bg-ink-100 p-2 dark:bg-ink-800">
          <dt className="muted text-xs">{t('stats.total')}</dt>
          <dd className="numeric font-bold">{data.events.length}</dd>
        </div>
        <div className="rounded-lg bg-ink-100 p-2 dark:bg-ink-800">
          <dt className="muted text-xs">{t('stats.matches')}</dt>
          <dd className="numeric font-bold">{data.matches.length}</dd>
        </div>
        <div className="rounded-lg bg-ink-100 p-2 dark:bg-ink-800">
          <dt className="muted text-xs">{t('settings.storage')}</dt>
          <dd className="numeric font-bold">{sizeKb} KB</dd>
        </div>
      </dl>

      <Modal
        open={confirmOpen}
        title={t('settings.resetConfirmTitle')}
        onClose={() => {
          setConfirmOpen(false)
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirmOpen(false)
              }}
            >
              {t('settings.cancel')}
            </Button>
            <Button variant="danger" onClick={handleReset} data-testid="reset-confirm">
              {t('settings.resetConfirm')}
            </Button>
          </>
        }
      >
        <p>{t('settings.resetConfirmBody')}</p>
      </Modal>
    </div>
  )
}
