import { useAppStore } from '@/store/appStore'
import { useI18n } from '@/hooks/useI18n'
import { useStats } from '@/hooks/useStats'
import { useNow } from '@/hooks/useI18n'
import { formatClock } from '@/lib/time'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function MatchBar() {
  const { t } = useI18n()
  const stats = useStats()
  const startMatch = useAppStore((state) => state.startMatch)
  const endMatch = useAppStore((state) => state.endMatch)
  const now = useNow(1000)

  const active = stats.activeMatch
  const elapsed = active === null ? '00:00' : formatClock((now - active.startedAt) / 1000)

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t('match.title')}</h2>
        <span
          className={
            active
              ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
              : 'muted text-xs font-medium'
          }
        >
          {active ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {t('match.active')}
            </>
          ) : (
            t('counter.noMatch')
          )}
        </span>
      </div>

      {active ? (
        <>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="muted text-xs font-medium uppercase">{t('counter.thisMatch')}</p>
              <p className="numeric text-3xl font-bold">{stats.currentMatch}</p>
            </div>
            <div className="text-right">
              <p className="muted text-xs font-medium uppercase">{t('match.elapsed')}</p>
              <p className="numeric text-xl font-semibold" data-testid="match-timer">
                {elapsed}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={() => {
              endMatch()
            }}
            data-testid="end-match"
          >
            {t('match.end')}
          </Button>
        </>
      ) : (
        <>
          <p className="muted text-sm">{t('counter.noMatch')}</p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => {
              startMatch()
            }}
            data-testid="start-match"
          >
            {t('match.start')}
          </Button>
        </>
      )}
    </Card>
  )
}
