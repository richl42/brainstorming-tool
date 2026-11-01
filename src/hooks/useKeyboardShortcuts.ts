import { useEffect } from 'react'
import { useCreateCard } from '../canvas/useCreateCard'

/** True when the event target is somewhere the user types (so shortcuts must not fire). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' ||
    (target.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'range'].includes((target as HTMLInputElement).type))
}

export function useKeyboardShortcuts() {
  const createCard = useCreateCard()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTypingTarget(e.target)) return
      const mod = e.metaKey || e.ctrlKey

      if (!mod && !e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault() // don't type "n" into the freshly focused card
        createCard('pointer')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [createCard])
}
