import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { useI18n } from '@/hooks/useI18n'
import { useStats } from '@/hooks/useStats'
import { resolveChestTypes } from '@/lib/chestTypes'
import { Card, CardTitle, Stat } from '@/components/ui/Card'
import { BarChart } from './BarChart'
import { DonutChart } from './DonutChart'

export function StatsPanel() {
  const { t } = useI18n()
  const stats = useStats()
  const customTypes = useAppStore((state) => state.customTypes)
  const types = useMemo(() => resolveChestTypes(customTypes), [customTypes])

  const average = stats.averagePerMatch === 0 ? '0' : stats.averagePerMatch.toFixed(1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Stat label={t('stats.total')} value={stats.total} accent />
        <Stat label={t('stats.today')} value={stats.today} />
        <Stat label={t('stats.avg')} value={average} hint={t('stats.perMatch')} />
        <Stat
          label={t('stats.best')}
          value={stats.bestMatch?.count ?? 0}
          hint={stats.bestMatch ? undefined : t('stats.noData')}
        />
        <Stat label={t('stats.matches')} value={stats.matchesPlayed} />
        <Stat label={t('stats.streak')} value={stats.streakDays} hint={t('stats.days')} />
      </div>

      {stats.total === 0 ? (
        <Card>
          <p className="muted text-sm">{t('stats.noData')}</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardTitle>{t('stats.byDay')}</CardTitle>
            <p className="muted mb-3 text-xs">{t('stats.trend')}</p>
            <BarChart points={stats.daily} label={t('stats.byDay')} />
          </Card>

          <Card>
            <CardTitle>{t('stats.byType')}</CardTitle>
            <DonutChart data={stats.byType} types={types} label={t('stats.byType')} />
          </Card>
        </div>
      )}
    </div>
  )
}
