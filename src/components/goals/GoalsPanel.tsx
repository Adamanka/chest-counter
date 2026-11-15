import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { useI18n } from '@/hooks/useI18n'
import { useStats } from '@/hooks/useStats'
import { useTypeName } from '@/hooks/useTypeName'
import { resolveChestTypes } from '@/lib/chestTypes'
import { completedGoals, goalProgress } from '@/lib/goals'
import { evaluateAchievements } from '@/lib/achievements'
import type { GoalMetric } from '@/types'
import type { TranslationKey } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { cn } from '@/lib/cn'

const METRICS: readonly GoalMetric[] = ['total', 'today', 'match', 'type']

const METRIC_KEYS: Record<GoalMetric, TranslationKey> = {
  total: 'goals.metric.total',
  today: 'goals.metric.today',
  match: 'goals.metric.match',
  type: 'goals.metric.type',
}

export function GoalsPanel() {
  const { t, locale } = useI18n()
  const typeName = useTypeName()
  const stats = useStats()
  const goals = useAppStore((state) => state.goals)
  const customTypes = useAppStore((state) => state.customTypes)
  const addGoal = useAppStore((state) => state.addGoal)
  const removeGoal = useAppStore((state) => state.removeGoal)

  const types = useMemo(() => resolveChestTypes(customTypes), [customTypes])
  const firstTypeId = types[0]?.id ?? 'common'

  const [metric, setMetric] = useState<GoalMetric>('total')
  const [target, setTarget] = useState('10')
  const [typeId, setTypeId] = useState(firstTypeId)

  const done = completedGoals(goals, stats)
  const achievements = evaluateAchievements({ stats, completedGoals: done })
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length

  const canSubmit = Number.isFinite(Number(target)) && Number(target) > 0

  const handleSubmit = (): void => {
    const value = Math.round(Number(target))
    if (!Number.isFinite(value) || value <= 0) return
    addGoal({ metric, target: value, typeId: metric === 'type' ? typeId : null })
    setTarget('10')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{t('goals.title')}</CardTitle>
        <p className="muted mb-4 text-sm">{t('goals.subtitle')}</p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
          <div>
            <label className="text-sm font-medium" htmlFor="goal-metric">
              {t('goals.metric')}
            </label>
            <select
              id="goal-metric"
              value={metric}
              onChange={(event) => {
                setMetric(event.target.value as GoalMetric)
              }}
              className="mt-1 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 dark:border-ink-700 dark:bg-ink-800"
            >
              {METRICS.map((option) => (
                <option key={option} value={option}>
                  {t(METRIC_KEYS[option])}
                </option>
              ))}
            </select>
          </div>

          {metric === 'type' ? (
            <div>
              <label className="text-sm font-medium" htmlFor="goal-type">
                {t('goals.type')}
              </label>
              <select
                id="goal-type"
                value={typeId}
                onChange={(event) => {
                  setTypeId(event.target.value)
                }}
                className="mt-1 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 dark:border-ink-700 dark:bg-ink-800"
              >
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.emoji} {typeName(type)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium" htmlFor="goal-target">
              {t('goals.target')}
            </label>
            <input
              id="goal-target"
              type="number"
              min={1}
              max={1_000_000}
              value={target}
              onChange={(event) => {
                setTarget(event.target.value)
              }}
              placeholder={t('goals.targetPlaceholder')}
              className="mt-1 h-11 w-full rounded-lg border border-ink-200 bg-white px-3 dark:border-ink-700 dark:bg-ink-800"
            />
          </div>

          <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
            {t('goals.create')}
          </Button>
        </div>

        <ul className="mt-5 space-y-3">
          {goals.length === 0 ? (
            <li className="muted text-sm">{t('goals.empty')}</li>
          ) : (
            goals.map((goal) => {
              const progress = goalProgress(goal, stats)
              const metricLabel = t(METRIC_KEYS[goal.metric])
              const type = types.find((candidate) => candidate.id === goal.typeId)
              return (
                <li
                  key={goal.id}
                  className="rounded-xl border border-ink-200 p-3 dark:border-ink-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {metricLabel}
                        {goal.metric === 'type' && type ? `: ${typeName(type)}` : ''}
                      </p>
                      <p className="muted numeric text-xs">
                        {t('goals.progress', {
                          current: progress.current.toLocaleString(locale),
                          target: progress.target.toLocaleString(locale),
                        })}
                        {progress.done ? ' · ✅ ' : ''}
                        {progress.done ? t('goals.done') : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeGoal(goal.id)
                      }}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      aria-label={`${t('goals.delete')}: ${metricLabel}`}
                    >
                      🗑
                    </button>
                  </div>
                  <ProgressBar
                    className="mt-2"
                    value={progress.current}
                    max={progress.target}
                    label={metricLabel}
                    tone={progress.done ? 'green' : 'brand'}
                  />
                </li>
              )
            })
          )}
        </ul>
      </Card>

      <Card>
        <CardTitle
          action={
            <span className="muted text-xs font-medium">
              {t('goals.unlocked', { unlocked, total: achievements.length })}
            </span>
          }
        >
          {t('goals.achievements')}
        </CardTitle>
        <p className="muted mb-4 text-sm">{t('goals.achievementsHint')}</p>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {achievements.map((achievement) => (
            <li
              key={achievement.id}
              className={cn(
                'rounded-xl border p-3',
                achievement.unlocked
                  ? 'border-brand-400 bg-brand-50 dark:border-brand-500/60 dark:bg-brand-900/30'
                  : 'border-ink-200 dark:border-ink-700',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn('text-xl', !achievement.unlocked && 'grayscale opacity-60')}
                >
                  {achievement.emoji}
                </span>
                <p className="text-sm font-semibold">{t(achievement.titleKey)}</p>
                {achievement.unlocked ? <span aria-label="unlocked">✅</span> : null}
              </div>
              <p className="muted mt-1 text-xs">{t(achievement.descriptionKey)}</p>
              <ProgressBar
                className="mt-2"
                value={achievement.current}
                max={achievement.target}
                label={t(achievement.titleKey)}
                tone={achievement.unlocked ? 'green' : 'brand'}
              />
              <p className="muted numeric mt-1 text-right text-[11px]">
                {achievement.current} / {achievement.target}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
