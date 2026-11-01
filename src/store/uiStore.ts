/**
 * Transient UI state that is not part of the board (dialogs, panels).
 * Kept separate from the board store so board logic stays UI-agnostic.
 */
import { create } from 'zustand'
import type { Board } from '../model/types'

export type DialogState =
  | { kind: 'shortcuts' }
  | { kind: 'confirm-clear' }
  | { kind: 'confirm-import'; board: Board }
  | { kind: 'error'; title: string; message: string }

interface UiState {
  dialog: DialogState | null
  openDialog: (dialog: DialogState) => void
  closeDialog: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  dialog: null,
  openDialog: (dialog) => set({ dialog }),
  closeDialog: () => set({ dialog: null }),
}))
