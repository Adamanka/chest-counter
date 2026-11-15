import { useI18n } from '@/hooks/useI18n'
import { TABS, type TabId } from './tabs'
import { cn } from '@/lib/cn'

export function Nav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  const { t } = useI18n()

  return (
    <>
      <nav aria-label={t('app.title')} className="mx-auto hidden max-w-6xl gap-1 px-4 pt-3 sm:flex">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onChange(tab.id)
              }}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`tab-${tab.id}`}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900'
                  : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
              )}
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {t(tab.labelKey)}
            </button>
          )
        })}
      </nav>

      <nav
        aria-label={t('app.title')}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden dark:border-ink-800 dark:bg-ink-950/95"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => {
            const isActive = tab.id === active
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(tab.id)
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={t(tab.labelKey)}
                  className={cn(
                    'flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold',
                    isActive ? 'text-brand-600 dark:text-brand-300' : 'muted',
                  )}
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    {tab.emoji}
                  </span>
                  {t(tab.labelKey)}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
