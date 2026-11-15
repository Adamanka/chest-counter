import { useAppStore } from '@/store/appStore'
import { useUiStore } from '@/store/uiStore'
import { useI18n } from '@/hooks/useI18n'
import { useTheme } from '@/hooks/useTheme'
import { IS_BETA } from '@/config'
import { cn } from '@/lib/cn'

const SAVE_KEYS = {
  idle: 'save.idle',
  saving: 'save.saving',
  saved: 'save.saved',
  error: 'save.error',
} as const

export function Header() {
  const { t, locale, setLocale } = useI18n()
  const { isDark } = useTheme()
  const updateSettings = useAppStore((state) => state.updateSettings)
  const saveStatus = useUiStore((state) => state.saveStatus)

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/80 bg-white/85 backdrop-blur dark:border-ink-800 dark:bg-ink-950/85">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <a href="#/counter" className="flex min-w-0 items-center gap-2 no-underline">
          <img
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
          />
          <span className="truncate text-base leading-tight font-black sm:text-lg">
            {t('app.title')}
          </span>
        </a>

        {IS_BETA ? (
          <span className="rounded-full bg-brand-400 px-2 py-0.5 text-[10px] font-black tracking-wide text-ink-900 uppercase">
            {t('beta.badge')}
          </span>
        ) : null}

        <span className="ml-auto hidden items-center gap-1.5 text-xs sm:flex" aria-live="polite">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              saveStatus === 'error'
                ? 'bg-red-500'
                : saveStatus === 'saving'
                  ? 'bg-amber-400'
                  : 'bg-emerald-500',
            )}
            aria-hidden="true"
          />
          <span className="muted" data-testid="save-status">
            {t(SAVE_KEYS[saveStatus])}
          </span>
        </span>

        <button
          type="button"
          onClick={() => {
            const next = isDark ? 'light' : 'dark'
            updateSettings({ theme: next })
          }}
          className="rounded-lg border border-ink-200 p-2 text-lg leading-none hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800"
          aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
          title={isDark ? t('theme.toLight') : t('theme.toDark')}
          data-testid="theme-toggle"
        >
          <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setLocale(locale === 'ru' ? 'en' : 'ru')
          }}
          className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-bold hover:bg-ink-100 dark:border-ink-700 dark:hover:bg-ink-800"
          aria-label={t('locale.switch')}
          title={t('locale.switch')}
          data-testid="locale-toggle"
        >
          {locale === 'ru' ? 'EN' : 'RU'}
        </button>
      </div>
    </header>
  )
}
