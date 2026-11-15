import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { startPersistence } from './store/persistence'
import { useAppStore } from './store/appStore'
import { applyThemeClass } from './hooks/useTheme'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element #root was not found in the document.')
}

// Apply the stored theme before the first paint to avoid a flash of the wrong theme.
const { theme, locale } = useAppStore.getState().settings
const prefersDark =
  typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
applyThemeClass(theme === 'dark' || (theme === 'system' && prefersDark))
document.documentElement.lang = locale

startPersistence()

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
