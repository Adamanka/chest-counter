import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useUiStore } from '@/store/uiStore'
import { useI18n } from '@/hooks/useI18n'
import { useTypeName } from '@/hooks/useTypeName'
import { useStats } from '@/hooks/useStats'
import { useClickSound } from '@/hooks/useClickSound'
import { resolveChestTypes, CUSTOM_TYPE_EMOJIS, DEFAULT_TYPE_ID } from '@/lib/chestTypes'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MatchBar } from '@/components/match/MatchBar'
import { cn } from '@/lib/cn'
import type { ResolvedChestType } from '@/lib/chestTypes'

export function CounterPanel() {
  const { t } = useI18n()
  const typeName = useTypeName()
  const stats = useStats()
  const customTypes = useAppStore((state) => state.customTypes)
  const addChest = useAppStore((state) => state.addChest)
  const decrementChest = useAppStore((state) => state.decrementChest)
  const addCustomType = useAppStore((state) => state.addCustomType)
  const removeCustomType = useAppStore((state) => state.removeCustomType)

  const selectedTypeId = useUiStore((state) => state.selectedTypeId)
  const setSelectedTypeId = useUiStore((state) => state.setSelectedTypeId)
  const playClick = useClickSound()

  const types = useMemo(() => resolveChestTypes(customTypes), [customTypes])
  const selected = types.find((type) => type.id === selectedTypeId) ?? types[0]
  const selectedCount = stats.byType.find((item) => item.typeId === selected?.id)?.count ?? 0

  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState<string>(CUSTOM_TYPE_EMOJIS[0])
  const [pendingDelete, setPendingDelete] = useState<ResolvedChestType | null>(null)

  const handleAdd = (typeId = selected?.id): void => {
    if (!typeId) return
    addChest(typeId)
    setSelectedTypeId(typeId)
    playClick()
  }

  const handleRemove = (): void => {
    if (!selected) return
    decrementChest(selected.id)
  }

  const handleCreate = (): void => {
    if (newName.trim() === '') return
    addCustomType(newName, newEmoji)
    setNewName('')
    setNewEmoji(CUSTOM_TYPE_EMOJIS[0])
    setCreateOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="flex flex-col items-center justify-between gap-4 text-center">
          <div className="w-full">
            <p className="muted text-sm font-medium">{t('counter.total')}</p>
            <p
              className="numeric text-6xl leading-none font-black sm:text-7xl"
              data-testid="total-count"
              aria-live="polite"
            >
              {stats.total}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="rounded-full bg-ink-100 px-3 py-1 font-medium dark:bg-ink-800">
                {t('counter.today')}: <span className="numeric font-bold">{stats.today}</span>
              </span>
              <span className="rounded-full bg-ink-100 px-3 py-1 font-medium dark:bg-ink-800">
                {t('counter.thisMatch')}:{' '}
                <span className="numeric font-bold">{stats.currentMatch}</span>
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3">
            <div className="muted flex items-center gap-2 text-sm">
              <span>{t('counter.selected')}:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1 font-semibold text-ink-900 dark:bg-ink-800 dark:text-ink-50">
                <span aria-hidden="true">{selected?.emoji}</span>
                {selected ? (selected.name ?? typeName(selected)) : ''}
                <span className="numeric">({selectedCount})</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                handleAdd()
              }}
              data-testid="add-chest"
              className={cn(
                'group relative flex h-32 w-full max-w-md flex-col items-center justify-center gap-1 rounded-3xl',
                'bg-brand-400 text-ink-900 shadow-lg shadow-brand-400/30 transition-transform',
                'hover:bg-brand-300 active:scale-[0.98] active:bg-brand-500',
                'focus-visible:outline-3 focus-visible:outline-offset-4',
              )}
              aria-describedby="add-hint"
            >
              <span aria-hidden="true" className="text-3xl">
                🧰
              </span>
              <span className="text-2xl font-black tracking-tight sm:text-3xl">
                {t('counter.add')}
              </span>
              <span className="text-xs font-medium opacity-70" id="add-hint">
                {t('counter.addHint')}
              </span>
            </button>

            <div className="flex w-full max-w-md items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleRemove}
                disabled={selectedCount === 0}
                data-testid="remove-chest"
                aria-label={t('counter.removeHint')}
                title={t('counter.removeHint')}
                className="flex-1"
              >
                {t('counter.remove')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <MatchBar />
          <Card>
            <h2 className="mb-3 text-base font-semibold">{t('stats.title')}</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="muted">{t('stats.today')}</dt>
                <dd className="numeric font-bold">{stats.today}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="muted">{t('stats.avg')}</dt>
                <dd className="numeric font-bold">
                  {stats.averagePerMatch === 0 ? '0' : stats.averagePerMatch.toFixed(1)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="muted">{t('stats.best')}</dt>
                <dd className="numeric font-bold">{stats.bestMatch?.count ?? 0}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="muted">{t('stats.streak')}</dt>
                <dd className="numeric font-bold">{stats.streakDays}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{t('counter.types')}</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCreateOpen(true)
            }}
          >
            + {t('counter.addTypeButton')}
          </Button>
        </div>

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {types.map((type) => {
            const count = stats.byType.find((item) => item.typeId === type.id)?.count ?? 0
            const isSelected = selected?.id === type.id
            return (
              <li key={type.id}>
                <div
                  className={cn(
                    'surface relative flex h-full flex-col gap-2 p-3 transition-colors',
                    isSelected && 'ring-2 ring-brand-400',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleAdd(type.id)
                    }}
                    className="flex flex-1 flex-col items-start gap-1 rounded-lg text-left"
                    aria-label={t('counter.addType', {
                      type: typeName(type),
                    })}
                  >
                    <span aria-hidden="true" className="text-xl">
                      {type.emoji}
                    </span>
                    <span className="w-full truncate text-sm font-semibold">{typeName(type)}</span>
                    <span className="numeric text-2xl font-bold">{count}</span>
                  </button>

                  <div className="flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        decrementChest(type.id)
                      }}
                      disabled={count === 0}
                      className="rounded-md border border-ink-200 px-2 py-0.5 text-sm font-bold disabled:opacity-40 dark:border-ink-700"
                      aria-label={`${t('counter.remove')} ${typeName(type)}`}
                    >
                      −1
                    </button>
                    {type.isCustom ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingDelete(type)
                        }}
                        className="rounded-md px-1.5 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        aria-label={`${t('counter.deleteType')}: ${type.name ?? ''}`}
                      >
                        ✕
                      </button>
                    ) : null}
                  </div>

                  <ProgressBar
                    value={count}
                    max={Math.max(stats.total, 1)}
                    label={`${typeName(type)}: ${String(count)}`}
                    className="h-1.5"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <Modal
        open={createOpen}
        title={t('counter.addTypeButton')}
        onClose={() => {
          setCreateOpen(false)
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setCreateOpen(false)
              }}
            >
              {t('counter.cancel')}
            </Button>
            <Button variant="primary" onClick={handleCreate} disabled={newName.trim() === ''}>
              {t('counter.create')}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium" htmlFor="new-type-name">
          {t('counter.typeName')}
        </label>
        <input
          id="new-type-name"
          value={newName}
          onChange={(event) => {
            setNewName(event.target.value)
          }}
          maxLength={40}
          placeholder={t('counter.namePlaceholder')}
          className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-base dark:border-ink-700 dark:bg-ink-800"
        />
        <fieldset className="mt-4">
          <legend className="text-sm font-medium">{t('counter.typeEmoji')}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CUSTOM_TYPE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setNewEmoji(emoji)
                }}
                aria-pressed={newEmoji === emoji}
                aria-label={emoji}
                className={cn(
                  'h-10 w-10 rounded-lg border text-xl',
                  newEmoji === emoji
                    ? 'border-brand-400 bg-brand-100 dark:bg-brand-900/40'
                    : 'border-ink-200 dark:border-ink-700',
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </fieldset>
      </Modal>

      <Modal
        open={pendingDelete !== null}
        title={t('counter.deleteType')}
        onClose={() => {
          setPendingDelete(null)
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setPendingDelete(null)
              }}
            >
              {t('counter.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingDelete) removeCustomType(pendingDelete.id)
                if (pendingDelete?.id === selected?.id) setSelectedTypeId(DEFAULT_TYPE_ID)
                setPendingDelete(null)
              }}
            >
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <p>{t('counter.deleteTypeConfirm', { name: pendingDelete?.name ?? '' })}</p>
      </Modal>
    </div>
  )
}
