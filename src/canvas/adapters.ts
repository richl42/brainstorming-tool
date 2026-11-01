/**
 * Conversion between our Card model and React Flow nodes.
 * React Flow is a *view* of the store: nodes are derived from cards, and
 * React Flow's change events are translated back into store actions.
 */
import { useMemo, useRef } from 'react'
import type { Node, NodeChange } from '@xyflow/react'
import type { Card, CardId } from '../model/types'
import { useBoardStore, type CardMap, type IdSet } from '../store/boardStore'

export type CardNodeData = { card: Card }
export type CardFlowNode = Node<CardNodeData, 'card'>

export const CARD_NODE_TYPE = 'card' as const

export function cardToNode(card: Card, selected: boolean, dragging: boolean): CardFlowNode {
  return {
    id: card.id,
    type: CARD_NODE_TYPE,
    position: { x: card.x, y: card.y },
    width: card.width,
    height: card.height,
    zIndex: card.zIndex,
    selected,
    dragging,
    data: { card },
  }
}

type CacheEntry = { card: Card; selected: boolean; dragging: boolean; node: CardFlowNode }

/**
 * Derive React Flow nodes from the store. Node objects are reused when their
 * card/selection/drag state is unchanged so React Flow can skip work for
 * untouched nodes — essential for smooth interaction with hundreds of cards.
 */
export function useCardNodes(): CardFlowNode[] {
  const cards = useBoardStore((s) => s.cards)
  const selectedIds = useBoardStore((s) => s.selectedIds)
  const draggingIds = useBoardStore((s) => s.draggingIds)
  const cache = useRef(new Map<CardId, CacheEntry>())

  return useMemo(() => buildNodes(cards, selectedIds, draggingIds, cache.current), [cards, selectedIds, draggingIds])
}

function buildNodes(cards: CardMap, selectedIds: IdSet, draggingIds: IdSet, cache: Map<CardId, CacheEntry>) {
  const nodes: CardFlowNode[] = []
  const seen = new Set<CardId>()
  for (const id in cards) {
    const card = cards[id]
    const selected = selectedIds.has(id)
    const dragging = draggingIds.has(id)
    const hit = cache.get(id)
    if (hit && hit.card === card && hit.selected === selected && hit.dragging === dragging) {
      nodes.push(hit.node)
    } else {
      const node = cardToNode(card, selected, dragging)
      cache.set(id, { card, selected, dragging, node })
      nodes.push(node)
    }
    seen.add(id)
  }
  if (cache.size !== seen.size) for (const id of cache.keys()) if (!seen.has(id)) cache.delete(id)
  return nodes
}

/**
 * Translate React Flow node changes into store actions.
 * We ignore "remove" (deletion is driven by our own shortcuts / toolbar) and
 * measurement-only "dimensions" changes (sizes come from the model).
 */
export function applyNodeChangesToStore(changes: NodeChange<CardFlowNode>[]) {
  const store = useBoardStore.getState()
  let moves: Record<CardId, { x: number; y: number }> | null = null
  let selection: Set<CardId> | null = null
  let dragging: Set<CardId> | null = null

  for (const change of changes) {
    switch (change.type) {
      case 'position':
        if (change.position) (moves ??= {})[change.id] = { x: change.position.x, y: change.position.y }
        if (change.dragging) (dragging ??= new Set()).add(change.id)
        break
      case 'dimensions':
        if (change.resizing && change.dimensions) {
          store.resizeCard(change.id, { width: change.dimensions.width, height: change.dimensions.height })
        }
        break
      case 'select':
        selection ??= new Set(store.selectedIds)
        if (change.selected) selection.add(change.id)
        else selection.delete(change.id)
        break
    }
  }

  if (moves) store.moveCards(moves)
  if (dragging) store.setDragging(dragging)
  if (selection) store.setSelection(selection)
}
