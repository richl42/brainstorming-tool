import { memo, useEffect, useRef, useState } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { CardFlowNode } from './adapters'
import { CARD_COLORS } from '../model/colors'
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
    <div
      className={`card-node ${isNew ? 'is-new' : ''} ${selected ? 'is-selected' : ''} ${dragging ? 'is-dragging' : ''} ${editing ? 'is-editing' : ''}`}
      style={{ background: palette.bg, ['--card-border' as string]: palette.border }}
      data-editing={editing || undefined}
      onDoubleClick={(e) => {
        e.stopPropagation()
        useBoardStore.getState().startEditing(id)
      }}
    >
      {editing ? (
        <CardTextEditor id={id} text={card.text} />
      ) : (
        <div className={`card-text ${card.text ? '' : 'is-placeholder'}`}>{card.text || PLACEHOLDER}</div>
      )}
    </div>
  )
}

function CardTextEditor({ id, text }: { id: string; text: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // preventScroll: focusing inside a transformed canvas must not scroll the pane.
    el.focus({ preventScroll: true })
    el.setSelectionRange(el.value.length, el.value.length)
  }, [])

  const finish = () => useBoardStore.getState().stopEditing()

  return (
    <textarea
      ref={ref}
      className="card-text nodrag nopan nowheel"
      value={text}
      placeholder={PLACEHOLDER}
      spellCheck={false}
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
