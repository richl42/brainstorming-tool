import { Panel } from '@xyflow/react'
import { useUiStore } from '../store/uiStore'

export function HelpButton() {
  return (
    <Panel position="top-right" className="!m-4">
      <button
        type="button"
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
        onClick={() => useUiStore.getState().openDialog({ kind: 'shortcuts' })}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white text-sm font-semibold text-gray-600 shadow-float transition-colors hover:text-gray-900"
      >
        ?
      </button>
    </Panel>
  )
}
