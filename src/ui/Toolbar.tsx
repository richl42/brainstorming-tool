import { Panel } from '@xyflow/react'
import { Plus } from 'lucide-react'
import { FloatingPanel } from './IconButton'
import { useCreateCard } from '../canvas/useCreateCard'

export function Toolbar() {
  const createCard = useCreateCard()

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
      </FloatingPanel>
    </Panel>
  )
}
