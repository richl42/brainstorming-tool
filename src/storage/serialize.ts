/**
 * Parsing/validation for boards coming from storage or user-imported files.
 * Untrusted input is normalised into a valid Board or rejected with a
 * readable error, so the rest of the app can trust the data model.
 */
import type { Board, Card, Viewport } from '../model/types'
import { DEFAULT_CARD_COLOR, isCardColor } from '../model/colors'
import {
  DEFAULT_BOARD_TITLE,
  DEFAULT_CARD_HEIGHT,
  DEFAULT_CARD_WIDTH,
  MIN_CARD_HEIGHT,
  MIN_CARD_WIDTH,
  newId,
} from '../model/factory'
import { MAX_ZOOM, MIN_ZOOM } from '../canvas/constants'

export const CURRENT_VERSION = 1

export class BoardParseError extends Error {}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function parseCard(raw: unknown, now: number): Card | null {
  if (!isObj(raw)) return null
  const x = num(raw.x, NaN)
  const y = num(raw.y, NaN)
  if (Number.isNaN(x) || Number.isNaN(y)) return null // a card without a position is meaningless
  const createdAt = num(raw.createdAt, now)
  return {
    id: str(raw.id, '') || newId(),
    text: str(raw.text, ''),
    color: isCardColor(raw.color) ? raw.color : DEFAULT_CARD_COLOR,
    x,
    y,
    width: Math.max(MIN_CARD_WIDTH, num(raw.width, DEFAULT_CARD_WIDTH)),
    height: Math.max(MIN_CARD_HEIGHT, num(raw.height, DEFAULT_CARD_HEIGHT)),
    zIndex: num(raw.zIndex, 0),
    createdAt,
    updatedAt: num(raw.updatedAt, createdAt),
  }
}

function parseViewport(raw: unknown): Viewport {
  if (!isObj(raw)) return { x: 0, y: 0, zoom: 1 }
  return { x: num(raw.x, 0), y: num(raw.y, 0), zoom: clamp(num(raw.zoom, 1), MIN_ZOOM, MAX_ZOOM) }
}

/** Validate and normalise an unknown value into a Board. Throws BoardParseError. */
export function parseBoard(raw: unknown): Board {
  if (!isObj(raw)) throw new BoardParseError('This file is not a board export.')
  if (!Array.isArray(raw.cards)) throw new BoardParseError('This file has no cards list, so it is not a board export.')
  const version = num(raw.version, CURRENT_VERSION)
  if (version > CURRENT_VERSION) {
    throw new BoardParseError('This board was saved by a newer version of the app.')
  }
  // Future: run migrations here when version < CURRENT_VERSION.

  const now = Date.now()
  const seen = new Set<string>()
  const cards: Card[] = []
  for (const item of raw.cards) {
    const card = parseCard(item, now)
    if (!card) continue
    if (seen.has(card.id)) card.id = newId() // keep ids unique
    seen.add(card.id)
    cards.push(card)
  }

  return {
    version: CURRENT_VERSION,
    id: str(raw.id, '') || newId(),
    title: str(raw.title, '').trim() || DEFAULT_BOARD_TITLE,
    cards,
    viewport: parseViewport(raw.viewport),
    updatedAt: num(raw.updatedAt, now),
  }
}

export function boardToJson(board: Board): string {
  return JSON.stringify(board, null, 2)
}

/** Parse JSON text (e.g. an imported file) into a Board. Throws BoardParseError. */
export function boardFromJson(text: string): Board {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new BoardParseError('This file is not valid JSON.')
  }
  return parseBoard(raw)
}
