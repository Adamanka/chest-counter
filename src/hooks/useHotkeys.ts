import { useEffect } from 'react'

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'])

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return INTERACTIVE_TAGS.has(target.tagName)
}

function hasOpenDialog(): boolean {
  return document.querySelector('[role="dialog"], dialog[open]') !== null
}

/** Global keyboard shortcuts. Disabled automatically in inputs and dialogs. */
export function useHotkeys(
  enabled: boolean,
  onAdd: () => void,
  onRemove: () => void,
  onUndo: () => void,
  onRedo: () => void,
): void {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (hasOpenDialog()) return
      if (isTypingTarget(event.target)) return

      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault()
        onAdd()
        return
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault()
        onRemove()
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'u') {
        event.preventDefault()
        onUndo()
      } else if (key === 'r') {
        event.preventDefault()
        onRedo()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [enabled, onAdd, onRemove, onUndo, onRedo])
}
