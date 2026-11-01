import type { Board, BoardId } from '../model/types'

/**
 * Persistence boundary. The app only talks to this interface, so replacing
 * localStorage with a database/API later means writing one new adapter.
 * Methods are async even though localStorage is sync, to match that future.
 */
export interface BoardStorage {
  /** Load the board the user had open last, or null if there is none. */
  loadCurrent(): Promise<Board | null>
  load(id: BoardId): Promise<Board | null>
  /** Save a board and remember it as the current one. */
  save(board: Board): Promise<void>
}
