/**
 * The storage layer: the single module the app uses to load and save boards.
 * Swap the adapter here to move from localStorage to a backend.
 */
import { createLocalStorageAdapter } from './localStorageAdapter'
import type { BoardStorage } from './types'

export const storage: BoardStorage = createLocalStorageAdapter()

export type { BoardStorage } from './types'
