/**
 * App-level data model. This is the source of truth and the shape that gets
 * persisted / exported / (later) synced. It is intentionally independent of
 * React Flow's node format — see canvas/adapters.ts for the conversion.
 */
import type { CardColor } from './colors'

export type CardId = string
export type BoardId = string

/** Epoch milliseconds. */
export type Timestamp = number

export interface Card {
  id: CardId
  text: string
  color: CardColor
  /** Top-left corner in canvas (world) coordinates. */
  x: number
  y: number
  width: number
  height: number
  /** Stacking order; higher is on top. */
  zIndex: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

/** Serialized board, as stored / exported. */
export interface Board {
  /** Schema version, bump when the shape changes so we can migrate. */
  version: 1
  id: BoardId
  title: string
  cards: Card[]
  viewport: Viewport
  updatedAt: Timestamp
}

/** Fields of a card that callers may change via updateCard. */
export type CardPatch = Partial<Omit<Card, 'id' | 'createdAt' | 'updatedAt'>>
