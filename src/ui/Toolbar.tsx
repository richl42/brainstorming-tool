import { Panel } from '@xyflow/react'
import { Plus, Redo2, Undo2 } from 'lucide-react'
import { FloatingPanel, IconButton } from './IconButton'
import { useCreateCard } from '../canvas/useCreateCard'
import { useBoardStore } from '../store/boardStore'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl+'

export function Toolbar() {
  const createCard = useCreateCard()
  const canUndo = useBoardStore((s) => s.canUndo)
  const canRedo = useBoardStore((s) => s.canRedo)

  return (
    <Panel position="top-center" className="!mt-4">
      <FloatingPanel>
        <button
          type="button"
          onClick={() => createCard('center')}
          title="Add card (N)"
          className="flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.25} />
          Add card
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <IconButton label={`Undo (${MOD}Z)`} disabled={!canUndo} onClick={() => useBoardStore.getState().undo()}>
          <Undo2 size={16} />
        </IconButton>
        <IconButton label={`Redo (${MOD}Shift+Z)`} disabled={!canRedo} onClick={() => useBoardStore.getState().redo()}>
          <Redo2 size={16} />
        </IconButton>
      </FloatingPanel>
    </Panel>
  )
}
