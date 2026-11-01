import { nanoid } from 'nanoid'
import type { Board, Card } from './types'
import { DEFAULT_CARD_COLOR } from './colors'

export const DEFAULT_CARD_WIDTH = 200
export const DEFAULT_CARD_HEIGHT = 140
export const MIN_CARD_WIDTH = 120
export const MIN_CARD_HEIGHT = 80
export const DEFAULT_BOARD_TITLE = 'Untitled board'

export const newId = () => nanoid(12)

export function createCard(init: Partial<Card> & Pick<Card, 'x' | 'y'>, now = Date.now()): Card {
  // Explicit field order keeps saved/exported JSON canonical and diff-friendly.
  return {
    id: init.id ?? newId(),
    text: init.text ?? '',
    color: init.color ?? DEFAULT_CARD_COLOR,
    x: init.x,
    y: init.y,
    width: init.width ?? DEFAULT_CARD_WIDTH,
    height: init.height ?? DEFAULT_CARD_HEIGHT,
    zIndex: init.zIndex ?? 0,
    createdAt: init.createdAt ?? now,
    updatedAt: init.updatedAt ?? init.createdAt ?? now,
  }
}

export function createBoard(init: Partial<Board> = {}): Board {
  return {
    version: 1,
    id: newId(),
    title: DEFAULT_BOARD_TITLE,
    cards: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    updatedAt: Date.now(),
    ...init,
  }
}
