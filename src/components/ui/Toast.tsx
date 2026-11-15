import { useEffect } from 'react'
import { useUiStore } from '@/store/uiStore'
import { cn } from '@/lib/cn'

const TOAST_MS = 4000

export function Toast() {
  const toast = useUiStore((state) => state.toast)
  const clearToast = useUiStore((state) => state.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => {
      clearToast()
    }, TOAST_MS)
    return () => {
      window.clearTimeout(id)
    }
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 sm:bottom-6">
      <div
        role={toast.kind === 'error' ? 'alert' : 'status'}
        aria-live={toast.kind === 'error' ? 'assertive' : 'polite'}
        className={cn(
          'pointer-events-auto flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
          toast.kind === 'error' && 'bg-red-600 text-white',
          toast.kind === 'success' && 'bg-emerald-600 text-white',
          toast.kind === 'info' && 'bg-ink-800 text-white dark:bg-ink-700',
        )}
      >
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={clearToast}
          className="rounded p-1 opacity-80 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
