import { useAppStore } from '@/store/appStore'
import { useI18n } from '@/hooks/useI18n'
import { ISSUES_URL } from '@/config'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DataPanel } from './DataPanel'
import { cn } from '@/lib/cn'
import type { Locale, ThemeMode } from '@/types'

const THEMES: readonly ThemeMode[] = ['light', 'dark', 'system']

const THEME_KEYS = {
  light: 'settings.theme.light',
  dark: 'settings.theme.dark',
  system: 'settings.theme.system',
} as const

const LOCALES: ReadonlyArray<{ value: Locale; labelKey: 'common.ru' | 'common.en' }> = [
  { value: 'ru', labelKey: 'common.ru' },
  { value: 'en', labelKey: 'common.en' },
]

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-xl border border-ink-200 bg-ink-100 p-1 dark:border-ink-700 dark:bg-ink-800"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => {
            onChange(option.value)
          }}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-white text-ink-900 shadow-sm dark:bg-ink-700 dark:text-ink-50'
              : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-ink-50',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsPanel() {
  const { t, locale, setLocale } = useI18n()
  const settings = useAppStore((state) => state.settings)
  const updateSettings = useAppStore((state) => state.updateSettings)

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">{t('settings.appearance')}</h2>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">{t('settings.theme')}</span>
            <Segmented
              label={t('settings.theme')}
              value={settings.theme}
              onChange={(theme) => {
                updateSettings({ theme })
              }}
              options={THEMES.map((theme) => ({ value: theme, label: t(THEME_KEYS[theme]) }))}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium">{t('settings.language')}</span>
            <Segmented
              label={t('settings.language')}
              value={locale}
              onChange={(next) => {
                setLocale(next)
              }}
              options={LOCALES.map((item) => ({ value: item.value, label: t(item.labelKey) }))}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">{t('settings.title')}</h2>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-ink-200 p-3 dark:border-ink-700">
          <input
            id="toggle-hotkeys"
            type="checkbox"
            checked={settings.hotkeys}
            onChange={(event) => {
              updateSettings({ hotkeys: event.target.checked })
            }}
            className="mt-0.5 h-5 w-5 accent-brand-500"
            data-testid="toggle-hotkeys"
          />
          <label htmlFor="toggle-hotkeys" className="cursor-pointer">
            <span className="block text-sm font-medium">{t('settings.hotkeys')}</span>
            <span className="muted block text-xs">{t('settings.hotkeysHint')}</span>
          </label>
        </div>

        <div className="mt-2 flex items-start gap-3 rounded-xl border border-ink-200 p-3 dark:border-ink-700">
          <input
            id="toggle-sound"
            type="checkbox"
            checked={settings.sound}
            onChange={(event) => {
              updateSettings({ sound: event.target.checked })
            }}
            className="mt-0.5 h-5 w-5 accent-brand-500"
            data-testid="toggle-sound"
          />
          <label htmlFor="toggle-sound" className="cursor-pointer">
            <span className="block text-sm font-medium">{t('settings.sound')}</span>
            <span className="muted block text-xs">{t('settings.soundHint')}</span>
          </label>
        </div>

        <div className="mt-4 border-t border-ink-200 pt-4 dark:border-ink-800">
          <DataPanel />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">{t('beta.reportBug')}</h2>
        <p className="muted mt-1 text-sm">{t('beta.feedback')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.open(ISSUES_URL, '_blank', 'noopener,noreferrer')
            }}
          >
            {t('beta.reportBug')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
