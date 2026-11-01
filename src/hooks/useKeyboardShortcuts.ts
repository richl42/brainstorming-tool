import { useEffect } from 'react'
import { useCreateCard } from '../canvas/useCreateCard'
import { useBoardStore } from '../store/boardStore'

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
        return
      }

      const store = useBoardStore.getState()

      if (mod && !e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        store.selectAll()
        return
      }

      if (mod && !e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault() // browser bookmark shortcut
        if (store.selectedIds.size) store.duplicateCards(store.selectedIds)
        return
      }

      if (!mod && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (store.selectedIds.size) {
          e.preventDefault()
          store.deleteCards(store.selectedIds)
        }
        return
      }

      if (e.key === 'Escape') {
        store.clearSelection()
        return
      }

      // Enter edits the selected card (when exactly one is selected).
      if (!mod && e.key === 'Enter') {
        if (store.selectedIds.size === 1) {
          e.preventDefault()
          store.startEditing([...store.selectedIds][0])
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [createCard])
}
