import { Component, type ErrorInfo, type ReactNode } from 'react'
import { createTranslator } from '@/i18n'
import { useAppStore } from '@/store/appStore'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string | null
}

/** Catches render errors so a broken view never wipes or blocks the app shell. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, message: null }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('Render error caught by ErrorBoundary', error, info.componentStack)
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    const locale = useAppStore.getState().settings.locale
    const t = createTranslator(locale)

    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="surface max-w-lg p-6 text-center">
          <p aria-hidden="true" className="text-4xl">
            🛠️
          </p>
          <h1 className="mt-2 text-xl font-bold">{t('error.boundary.title')}</h1>
          <p className="muted mt-2 text-sm">{t('error.boundary.body')}</p>
          {this.state.message ? (
            <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-ink-100 p-2 text-left text-xs dark:bg-ink-800">
              {this.state.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => {
              window.location.reload()
            }}
            className="mt-4 rounded-xl bg-brand-400 px-4 py-2 font-semibold text-ink-900"
          >
            {t('error.boundary.reload')}
          </button>
        </div>
      </div>
    )
  }
}
