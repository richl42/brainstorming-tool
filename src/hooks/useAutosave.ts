import { useEffect } from 'react'
import { useBoardStore, type BoardState } from '../store/boardStore'
import { storage } from '../storage'
import { useSaveStatus } from '../storage/saveStatus'

export const AUTOSAVE_DELAY_MS = 500

/** Did anything that gets persisted change? (Session state like selection is ignored.) */
const docChanged = (a: BoardState, b: BoardState) =>
  a.cards !== b.cards || a.title !== b.title || a.viewport !== b.viewport || a.id !== b.id

/**
 * Save the board shortly after every change (debounced), and immediately
 * when the page is hidden or closed so the last edit is never lost.
 */
export function useAutosave() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    let dirty = false

    const save = async () => {
      if (timer) clearTimeout(timer)
      timer = null
      if (!dirty) return
      dirty = false
      try {
        await storage.save(useBoardStore.getState().getBoard())
        if (!dirty) useSaveStatus.setState({ status: 'saved', lastSavedAt: Date.now(), error: null })
      } catch (err) {
        const quota = err instanceof DOMException && err.name === 'QuotaExceededError'
        useSaveStatus.setState({
          status: 'error',
          error: quota ? 'Browser storage is full' : 'Could not save changes',
        })
      }
    }

    const unsubscribe = useBoardStore.subscribe((state, prev) => {
      if (!docChanged(state, prev)) return
      dirty = true
      if (useSaveStatus.getState().status !== 'pending') useSaveStatus.setState({ status: 'pending' })
      if (timer) clearTimeout(timer)
      timer = setTimeout(save, AUTOSAVE_DELAY_MS)
    })

    const flush = () => void save()
    const onVisibility = () => document.visibilityState === 'hidden' && flush()
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      unsubscribe()
      flush()
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
