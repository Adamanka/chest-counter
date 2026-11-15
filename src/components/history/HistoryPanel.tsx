import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useUiStore } from '@/store/uiStore'
import { useI18n } from '@/hooks/useI18n'
import { useTypeName } from '@/hooks/useTypeName'
import { resolveChestTypes } from '@/lib/chestTypes'
import { formatDateTime, formatTime } from '@/lib/time'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const PAGE_SIZE = 50

export function HistoryPanel() {
  const { t, locale } = useI18n()
  const typeName = useTypeName()
  const events = useAppStore((state) => state.events)
  const matches = useAppStore((state) => state.matches)
  const customTypes = useAppStore((state) => state.customTypes)
  const deleteEvent = useAppStore((state) => state.deleteEvent)
  const undo = useAppStore((state) => state.undo)
  const redo = useAppStore((state) => state.redo)
  const canUndo = useAppStore((state) => state.past.length > 0)
  const canRedo = useAppStore((state) => state.future.length > 0)
  const showToast = useUiStore((state) => state.showToast)

  const [visible, setVisible] = useState(PAGE_SIZE)

  const types = useMemo(() => resolveChestTypes(customTypes), [customTypes])
  const matchIds = useMemo(() => new Set(matches.map((match) => match.id)), [matches])
  const reversed = useMemo(() => [...events].reverse(), [events])
  const localeTag = locale === 'ru' ? 'ru-RU' : 'en-US'
  const todayKey = new Date().toDateString()

  const handleUndo = (): void => {
    const ok = undo()
    showToast(ok ? 'info' : 'info', t(ok ? 'toast.undoDone' : 'toast.nothingToUndo'))
  }

  const handleRedo = (): void => {
    const ok = redo()
    showToast(ok ? 'info' : 'info', t(ok ? 'toast.redoDone' : 'toast.nothingToRedo'))
  }

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t('history.title')}</h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUndo}
            disabled={!canUndo}
            data-testid="undo"
          >
            ↶ {t('history.undo')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRedo}
            disabled={!canRedo}
            data-testid="redo"
          >
            ↷ {t('history.redo')}
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="muted text-sm">{t('history.empty')}</p>
      ) : (
        <>
          <ul className="divide-y divide-ink-200 dark:divide-ink-800">
            {reversed.slice(0, visible).map((event) => {
              const type = types.find((candidate) => candidate.id === event.typeId)
              const isToday = new Date(event.at).toDateString() === todayKey
              const inMatch = event.matchId !== null && matchIds.has(event.matchId)
              return (
                <li
                  key={event.id}
                  className="flex items-center gap-3 py-2"
                  data-testid="history-item"
                >
                  <span aria-hidden="true" className="text-xl">
                    {type?.emoji ?? '📦'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {type ? typeName(type) : event.typeId}
                    </p>
                    <p className="muted text-xs">
                      <time dateTime={new Date(event.at).toISOString()}>
                        {isToday
                          ? formatTime(event.at, localeTag)
                          : formatDateTime(event.at, localeTag)}
                      </time>
                      {' · '}
                      {inMatch ? t('history.match') : t('history.noMatch')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteEvent(event.id)
                    }}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    aria-label={`${t('history.delete')}: ${type ? typeName(type) : event.typeId}`}
                  >
                    🗑
                  </button>
                </li>
              )
            })}
          </ul>

          {visible < events.length ? (
            <div className="mt-3 space-y-2 text-center">
              <p className="muted text-xs">{t('history.hidden', { count: visible })}</p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setVisible(visible + PAGE_SIZE)
                }}
              >
                {t('history.showMore')}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </Card>
  )
}
