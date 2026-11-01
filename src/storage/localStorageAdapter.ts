import type { Board, BoardId } from '../model/types'
import type { BoardStorage } from './types'
import { parseBoard } from './serialize'

const PREFIX = 'brainstorm:v1'
const boardKey = (id: BoardId) => `${PREFIX}:board:${id}`
const CURRENT_KEY = `${PREFIX}:current`

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null // storage blocked (private mode, disabled cookies…)
  }
}

export function createLocalStorageAdapter(): BoardStorage {
  const load = async (id: BoardId): Promise<Board | null> => {
    const text = read(boardKey(id))
    if (!text) return null
    try {
      return parseBoard(JSON.parse(text))
    } catch (err) {
      // Move the unreadable data aside instead of overwriting it on the next save.
      try {
        localStorage.setItem(`${boardKey(id)}:corrupt:${Date.now()}`, text)
        localStorage.removeItem(boardKey(id))
      } catch {
        /* ignore */
      }
      console.warn('Saved board could not be read; starting a new one.', err)
      return null
    }
  }

  return {
    load,
    async loadCurrent() {
      const id = read(CURRENT_KEY)
      return id ? load(id) : null
    },
    async save(board) {
      // Throws on quota errors; the autosave hook reports it.
      localStorage.setItem(boardKey(board.id), JSON.stringify(board))
      localStorage.setItem(CURRENT_KEY, board.id)
    },
  }
}
