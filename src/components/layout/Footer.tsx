import { useI18n } from '@/hooks/useI18n'
import { APP_VERSION, ISSUES_URL, REPO_URL } from '@/config'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="mt-8 border-t border-ink-200 px-4 pt-6 pb-24 text-center text-sm sm:pb-6 dark:border-ink-800">
      <p className="font-medium">{t('footer.disclaimer')}</p>
      <p className="muted mt-1 text-xs">{t('footer.privacy')}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
        <a className="underline underline-offset-2 hover:no-underline" href={REPO_URL}>
          GitHub
        </a>
        <a className="underline underline-offset-2 hover:no-underline" href={ISSUES_URL}>
          {t('beta.reportBug')}
        </a>
        <span className="muted">
          {t('footer.version')} {APP_VERSION}
        </span>
      </div>
    </footer>
  )
}
