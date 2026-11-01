import { memo, useLayoutEffect, useRef, useState } from 'react'
import { NodeResizeControl, type NodeProps } from '@xyflow/react'
import type { CardFlowNode } from './adapters'
import { CARD_COLORS } from '../model/colors'
import { MIN_CARD_HEIGHT, MIN_CARD_WIDTH } from '../model/factory'
import { useBoardStore } from '../store/boardStore'

const PLACEHOLDER = 'Type an idea...'

function CardNodeView({ id, data, selected, dragging }: NodeProps<CardFlowNode>) {
  const { card } = data
  const editing = useBoardStore((s) => s.editingId === id)
  const palette = CARD_COLORS[card.color]
  // Only play the "appear" animation for brand-new cards, not when an existing
  // card scrolls back into view (off-screen cards are unmounted).
  const [isNew] = useState(() => Date.now() - card.createdAt < 500)

  return (
    // `nokey`: with Shift held React Flow would otherwise start a selection box even
    // when pressing on a card, swallowing Shift+click (toggle selection).
    <div
      className={`card-node nokey ${isNew ? 'is-new' : ''} ${selected ? 'is-selected' : ''} ${dragging ? 'is-dragging' : ''} ${editing ? 'is-editing' : ''}`}
      style={{ background: palette.bg, ['--card-border' as string]: palette.border }}
      data-editing={editing || undefined}
      onDoubleClick={(e) => {
        e.stopPropagation()
        useBoardStore.getState().startEditing(id)
      }}
    >
      {editing ? (
        <CardTextEditor id={id} text={card.text} height={card.height} />
      ) : (
        <div className={`card-text ${card.text ? '' : 'is-placeholder'}`}>{card.text || PLACEHOLDER}</div>
      )}

      <NodeResizeControl
        position="bottom-right"
        className="card-resize"
        minWidth={MIN_CARD_WIDTH}
        minHeight={MIN_CARD_HEIGHT}
        onResizeStart={() => useBoardStore.getState().bringToFront([id])}
      >
        <svg viewBox="0 0 10 10" aria-hidden>
          <path d="M9 3 L3 9 M9 6.5 L6.5 9" />
        </svg>
      </NodeResizeControl>
    </div>
  )
}

function CardTextEditor({ id, text, height }: { id: string; text: string; height: number }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // preventScroll: focusing inside a transformed canvas must not scroll the pane.
    el.focus({ preventScroll: true })
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  // Grow the card while typing so text never hides below the fold.
  // scrollHeight is in unscaled CSS px, i.e. canvas units, regardless of zoom.
  useLayoutEffect(() => {
    const el = ref.current
    if (el && el.scrollHeight > height + 1) {
      useBoardStore.getState().resizeCard(id, { width: el.offsetWidth, height: el.scrollHeight })
    }
  }, [id, text, height])

  const finish = () => useBoardStore.getState().stopEditing()

  return (
    <textarea
      ref={ref}
      className="card-text nodrag nopan nowheel"
      value={text}
      placeholder={PLACEHOLDER}
      spellCheck={false}
      aria-label="Card text"
      onChange={(e) => useBoardStore.getState().setCardText(id, e.target.value)}
      onBlur={finish}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
          e.preventDefault()
          e.stopPropagation()
          finish()
        }
      }}
    />
  )
}

export const CardNode = memo(CardNodeView)
