import { create } from 'zustand'

export type SaveStatus = 'saved' | 'pending' | 'error'

interface SaveStatusState {
  status: SaveStatus
  lastSavedAt: number | null
  error: string | null
}

/** UI-facing save state, written by useAutosave and read by SaveIndicator. */
export const useSaveStatus = create<SaveStatusState>()(() => ({ status: 'saved', lastSavedAt: null, error: null }))
