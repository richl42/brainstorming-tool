/**
 * The single store for the board. Every change to board content goes through
 * one of the actions below, so future features (multiplayer sync, AI-generated
 * cards, clustering…) can call the same functions and get identical behaviour.
 *
 * The state is split in two:
 *  - document state (id, title, cards, viewport) — persisted and exported
 *  - session state (selection, editing, dragging) — local to this tab only
 *
 * Usage outside React: `useBoardStore.getState().createCard({ x, y })`.
 */
import { create } from 'zustand'
import type { Board, BoardId, Card, CardId, CardPatch, Viewport } from '../model/types'
import { createBoard, createCard as makeCard, DEFAULT_BOARD_TITLE, newId } from '../model/factory'
import type { CardColor } from '../model/colors'
import { History, type DocSnapshot, type GestureKind } from './history'

export type CardMap = Record<CardId, Card>
export type IdSet = ReadonlySet<CardId>

const EMPTY_SET: IdSet = new Set()

export interface BoardState {
  // ── Document ────────────────────────────────────────────────────────────
  id: BoardId
  title: string
  cards: CardMap
  viewport: Viewport
  updatedAt: number

  // ── Session (not persisted) ─────────────────────────────────────────────
  selectedIds: IdSet
  editingId: CardId | null
  draggingIds: IdSet
  canUndo: boolean
  canRedo: boolean

  // ── Card actions ────────────────────────────────────────────────────────
  /** Create a card. `x`/`y` are its top-left corner in canvas coordinates. */
  createCard: (init: Partial<Omit<Card, 'id'>> & { x: number; y: number }, opts?: { select?: boolean; edit?: boolean }) => Card
  updateCard: (id: CardId, patch: CardPatch) => void
  /** Apply many patches at once (one render, one future undo step). */
  updateCards: (patches: Record<CardId, CardPatch>) => void
  moveCards: (positions: Record<CardId, { x: number; y: number }>) => void
  resizeCard: (id: CardId, rect: { width: number; height: number; x?: number; y?: number }) => void
  setCardText: (id: CardId, text: string) => void
  setCardsColor: (ids: Iterable<CardId>, color: CardColor) => void
  deleteCards: (ids: Iterable<CardId>) => void
  /** Duplicate cards with an offset; the copies become the selection. */
  duplicateCards: (ids: Iterable<CardId>, offset?: number) => Card[]
  bringToFront: (ids: Iterable<CardId>) => void

  // ── Board actions ───────────────────────────────────────────────────────
  setTitle: (title: string) => void
  setViewport: (viewport: Viewport) => void
  clearBoard: () => void
  /** Replace the whole document (load from storage / import). */
  loadBoard: (board: Board) => void
  /** Snapshot the document in its serialized form. */
  getBoard: () => Board

  // ── History ─────────────────────────────────────────────────────────────
  undo: () => void
  redo: () => void
  /**
   * Group every change until endGesture into a single undo step
   * (used for drags, resizes and text editing).
   */
  beginGesture: (kind: GestureKind) => void
  endGesture: (kind: GestureKind) => void

  // ── Session actions ─────────────────────────────────────────────────────
  setSelection: (ids: Iterable<CardId>) => void
  toggleSelected: (id: CardId) => void
  selectAll: () => void
  clearSelection: () => void
  startEditing: (id: CardId) => void
  stopEditing: () => void
  setDragging: (ids: Iterable<CardId>) => void
}

function maxZ(cards: CardMap): number {
  let z = 0
  for (const id in cards) if (cards[id].zIndex > z) z = cards[id].zIndex
  return z
}

function sameSet(a: IdSet, b: IdSet) {
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

function toMap(cards: Card[]): CardMap {
  const map: CardMap = {}
  for (const c of cards) map[c.id] = c
  return map
}

const initial = createBoard()

export const useBoardStore = create<BoardState>()((set, get) => {
  /**
   * Central write path for document changes. Every content mutation goes
   * through here, which makes it the natural hook point for undo history
   * (step 5) and, later, for broadcasting changes to collaborators.
   */
  const history = new History()
  const snapshot = (): DocSnapshot => ({ cards: get().cards, title: get().title })
  const historyFlags = () => ({ canUndo: history.canUndo, canRedo: history.canRedo })

  const commitDoc = (doc: Partial<DocSnapshot>, extra: Partial<BoardState> = {}) => {
    history.willChange(snapshot())
    set({ ...doc, updatedAt: Date.now(), ...extra, ...historyFlags() })
  }
  const commitCards = (next: CardMap, extra: Partial<BoardState> = {}) => commitDoc({ cards: next }, extra)

  /** Restore a snapshot from undo/redo, dropping session state that no longer applies. */
  const restore = (doc: DocSnapshot | null) => {
    if (!doc) return
    const { selectedIds } = get()
    set({
      cards: doc.cards,
      title: doc.title,
      updatedAt: Date.now(),
      selectedIds: new Set([...selectedIds].filter((id) => id in doc.cards)),
      editingId: null,
      draggingIds: EMPTY_SET,
      ...historyFlags(),
    })
  }

  const patchCards = (patches: Record<CardId, CardPatch>) => {
    const { cards } = get()
    const now = Date.now()
    let next: CardMap | null = null
    for (const id in patches) {
      const card = cards[id]
      if (!card) continue
      next ??= { ...cards }
      next[id] = { ...card, ...patches[id], updatedAt: now }
    }
    if (next) commitCards(next)
  }

  return {
    id: initial.id,
    title: initial.title,
    cards: {},
    viewport: initial.viewport,
    updatedAt: initial.updatedAt,

    selectedIds: EMPTY_SET,
    editingId: null,
    draggingIds: EMPTY_SET,
    canUndo: false,
    canRedo: false,

    createCard: (init, opts = {}) => {
      const { cards } = get()
      const card = makeCard({ ...init, zIndex: maxZ(cards) + 1 })
      commitCards(
        { ...cards, [card.id]: card },
        {
          ...(opts.select || opts.edit ? { selectedIds: new Set([card.id]) } : {}),
          ...(opts.edit ? { editingId: card.id } : {}),
        },
      )
      // Typing into a just-created card belongs to the same undo step as creating it.
      if (opts.edit) history.beginGesture('edit', snapshot(), true)
      return card
    },

    updateCard: (id, patch) => patchCards({ [id]: patch }),
    updateCards: patchCards,
    moveCards: (positions) => patchCards(positions),
    resizeCard: (id, rect) => patchCards({ [id]: rect }),

    setCardText: (id, text) => {
      if (get().cards[id]?.text === text) return
      patchCards({ [id]: { text } })
    },

    setCardsColor: (ids, color) => {
      const { cards } = get()
      const patches: Record<CardId, CardPatch> = {}
      for (const id of ids) if (cards[id] && cards[id].color !== color) patches[id] = { color }
      patchCards(patches)
    },

    deleteCards: (ids) => {
      const { cards, selectedIds, editingId } = get()
      const doomed = new Set([...ids].filter((id) => id in cards))
      if (doomed.size === 0) return
      const next = { ...cards }
      for (const id of doomed) delete next[id]
      commitCards(next, {
        selectedIds: new Set([...selectedIds].filter((id) => !doomed.has(id))),
        editingId: editingId && doomed.has(editingId) ? null : editingId,
      })
    },

    duplicateCards: (ids, offset = 24) => {
      const { cards } = get()
      const sources = [...ids].map((id) => cards[id]).filter(Boolean).sort((a, b) => a.zIndex - b.zIndex)
      if (sources.length === 0) return []
      const now = Date.now()
      let z = maxZ(cards)
      const copies = sources.map((src) => ({
        ...src,
        id: newId(),
        x: src.x + offset,
        y: src.y + offset,
        zIndex: ++z,
        createdAt: now,
        updatedAt: now,
      }))
      commitCards({ ...cards, ...toMap(copies) }, { selectedIds: new Set(copies.map((c) => c.id)), editingId: null })
      return copies
    },

    bringToFront: (ids) => {
      const { cards } = get()
      const list = [...ids].map((id) => cards[id]).filter(Boolean).sort((a, b) => a.zIndex - b.zIndex)
      if (list.length === 0) return
      const top = maxZ(cards)
      // Already on top (and in the same relative order)? Then nothing to do.
      const alreadyTop = list.every((c, i) => c.zIndex === top - list.length + 1 + i)
      if (alreadyTop) return
      // z-order isn't "content", so don't bump updatedAt.
      const next = { ...cards }
      list.forEach((c, i) => (next[c.id] = { ...c, zIndex: top + 1 + i }))
      set({ cards: next })
    },

    setTitle: (title) => {
      const clean = title.trim() || DEFAULT_BOARD_TITLE
      if (clean !== get().title) commitDoc({ title: clean })
    },

    setViewport: (viewport) => {
      const v = get().viewport
      if (v.x !== viewport.x || v.y !== viewport.y || v.zoom !== viewport.zoom) set({ viewport: { ...viewport } })
    },

    clearBoard: () => commitCards({}, { selectedIds: EMPTY_SET, editingId: null, draggingIds: EMPTY_SET }),

    loadBoard: (board) => {
      history.clear()
      set({
        id: board.id,
        title: board.title,
        cards: toMap(board.cards),
        viewport: board.viewport,
        updatedAt: board.updatedAt,
        selectedIds: EMPTY_SET,
        editingId: null,
        draggingIds: EMPTY_SET,
        ...historyFlags(),
      })
    },

    getBoard: () => {
      const { id, title, cards, viewport, updatedAt } = get()
      return { version: 1, id, title, cards: Object.values(cards), viewport, updatedAt }
    },

    setSelection: (ids) => {
      const next = new Set(ids)
      if (!sameSet(next, get().selectedIds)) set({ selectedIds: next })
    },
    toggleSelected: (id) => {
      const next = new Set(get().selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      set({ selectedIds: next })
    },
    selectAll: () => set({ selectedIds: new Set(Object.keys(get().cards)) }),
    clearSelection: () => {
      if (get().selectedIds.size) set({ selectedIds: EMPTY_SET })
    },

    undo: () => restore(history.undo(snapshot())),
    redo: () => restore(history.redo(snapshot())),
    beginGesture: (kind) => history.beginGesture(kind, snapshot()),
    endGesture: (kind) => history.endGesture(kind),

    startEditing: (id) => {
      if (!(id in get().cards)) return
      history.beginGesture('edit', snapshot())
      set({ editingId: id, selectedIds: new Set([id]) })
    },
    stopEditing: () => {
      history.endGesture('edit')
      if (get().editingId) set({ editingId: null })
    },

    setDragging: (ids) => {
      const next = new Set(ids)
      if (!sameSet(next, get().draggingIds)) set({ draggingIds: next.size ? next : EMPTY_SET })
    },
  }
})

/** Cards sorted bottom-to-top. Handy for exports, AI features, etc. */
export const selectCardList = (s: BoardState) => Object.values(s.cards).sort((a, b) => a.zIndex - b.zIndex)

// Dev-only handle for debugging and browser tests: `window.__board.getState()`.
if (import.meta.env.DEV) (window as unknown as { __board: typeof useBoardStore }).__board = useBoardStore
