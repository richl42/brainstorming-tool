import { NodeToolbar, Position } from '@xyflow/react'
import { Copy, Trash2 } from 'lucide-react'
import { CARD_COLOR_IDS, CARD_COLORS } from '../model/colors'
import { useBoardStore } from '../store/boardStore'
import { FloatingPanel, IconButton } from '../ui/IconButton'

/** Floating toolbar above the selected card(s): colour, duplicate, delete. */
export function SelectionToolbar() {
  const selectedIds = useBoardStore((s) => s.selectedIds)
  const isDragging = useBoardStore((s) => s.draggingIds.size > 0)
  // The colour shared by every selected card, or null if mixed.
  const commonColor = useBoardStore((s) => {
    let color: string | null = null
    for (const id of s.selectedIds) {
      const c = s.cards[id]?.color
      if (color === null) color = c ?? null
      else if (c !== color) return null
    }
    return color
  })

  if (selectedIds.size === 0) return null
  const ids = [...selectedIds]
  const store = useBoardStore.getState

  return (
    <NodeToolbar nodeId={ids} isVisible={!isDragging} position={Position.Top} offset={14}>
      <FloatingPanel className="selection-toolbar gap-1">
        <div className="flex items-center gap-1 px-1" role="radiogroup" aria-label="Card colour">
          {CARD_COLOR_IDS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={commonColor === color}
              aria-label={CARD_COLORS[color].label}
              title={CARD_COLORS[color].label}
              onClick={() => store().setCardsColor(selectedIds, color)}
              className={`h-5 w-5 rounded-full border transition-transform hover:scale-115 ${
                commonColor === color ? 'ring-2 ring-accent ring-offset-2' : ''
              }`}
              style={{ background: CARD_COLORS[color].bg, borderColor: CARD_COLORS[color].border }}
            />
          ))}
        </div>
        <div className="mx-0.5 h-5 w-px bg-gray-200" />
        <IconButton label="Duplicate (⌘/Ctrl+D)" onClick={() => store().duplicateCards(selectedIds)}>
          <Copy size={15} />
        </IconButton>
        <IconButton
          label="Delete (Del)"
          onClick={() => store().deleteCards(selectedIds)}
          className="hover:!bg-red-50 hover:!text-red-600"
        >
          <Trash2 size={15} />
        </IconButton>
        {ids.length > 1 && <span className="pr-2 pl-0.5 text-xs tabular-nums text-gray-500">{ids.length} selected</span>}
      </FloatingPanel>
    </NodeToolbar>
  )
}
