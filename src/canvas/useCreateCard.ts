import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useBoardStore } from '../store/boardStore'
import { DEFAULT_CARD_HEIGHT, DEFAULT_CARD_WIDTH } from '../model/factory'
import { lastCanvasPointer } from './pointer'

export type CardPlacement = 'center' | 'pointer' | { clientX: number; clientY: number }

const NUDGE = 24

/**
 * Returns a function that creates a card centred on a screen location, then
 * selects it and opens it for editing.
 *  - 'center':  centre of the visible canvas
 *  - 'pointer': under the mouse if it's over the canvas, else centre
 */
export function useCreateCard() {
  const { screenToFlowPosition } = useReactFlow()

  return useCallback(
    (where: CardPlacement) => {
      let client: { x: number; y: number }
      let avoidOverlap = false
      if (typeof where === 'object') {
        client = { x: where.clientX, y: where.clientY }
      } else if (where === 'pointer' && lastCanvasPointer.current) {
        client = lastCanvasPointer.current
      } else {
        const pane = document.querySelector('.react-flow')?.getBoundingClientRect()
        client = pane ? { x: pane.left + pane.width / 2, y: pane.top + pane.height / 2 } : { x: innerWidth / 2, y: innerHeight / 2 }
        avoidOverlap = true
      }

      const p = screenToFlowPosition(client)
      let x = Math.round(p.x - DEFAULT_CARD_WIDTH / 2)
      let y = Math.round(p.y - DEFAULT_CARD_HEIGHT / 2)

      // Repeatedly adding at the centre shouldn't stack cards exactly on top of each other.
      if (avoidOverlap) {
        const cards = Object.values(useBoardStore.getState().cards)
        for (let i = 0; i < 50 && cards.some((c) => Math.abs(c.x - x) < 4 && Math.abs(c.y - y) < 4); i++) {
          x += NUDGE
          y += NUDGE
        }
      }

      return useBoardStore.getState().createCard({ x, y }, { select: true, edit: true })
    },
    [screenToFlowPosition],
  )
}
