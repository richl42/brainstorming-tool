import { useRef } from 'react'
import { Panel } from '@xyflow/react'
import { Download, Eraser, Plus, Redo2, Undo2, Upload } from 'lucide-react'
import { FloatingPanel, IconButton } from './IconButton'
import { BoardTitle } from './BoardTitle'
import { MoreMenu } from './MoreMenu'
import { useCreateCard } from '../canvas/useCreateCard'
import { useBoardCommands } from '../canvas/useBoardCommands'
import { useBoardStore } from '../store/boardStore'
import { useUiStore } from '../store/uiStore'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl+'

const Divider = () => <div className="mx-0.5 h-5 w-px shrink-0 bg-gray-200" />

export function Toolbar() {
  const createCard = useCreateCard()
  const { exportJson, importFile } = useBoardCommands()
  const canUndo = useBoardStore((s) => s.canUndo)
  const canRedo = useBoardStore((s) => s.canRedo)
  const isEmpty = useBoardStore((s) => Object.keys(s.cards).length === 0)
  const fileInput = useRef<HTMLInputElement>(null)
  const openImport = () => fileInput.current?.click()
  const confirmClear = () => useUiStore.getState().openDialog({ kind: 'confirm-clear' })

  return (
    <Panel position="top-center" className="main-toolbar !mt-4">
      <FloatingPanel className="gap-1">
        <BoardTitle />
        <Divider />
        <button
          type="button"
          onClick={() => createCard('center')}
          title="Add card (N)"
          aria-label="Add card"
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-accent px-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.98] sm:px-3"
        >
          <Plus size={16} strokeWidth={2.25} />
          <span className="hidden sm:inline">Add card</span>
        </button>
        <Divider />
        <IconButton label={`Undo (${MOD}Z)`} disabled={!canUndo} onClick={() => useBoardStore.getState().undo()}>
          <Undo2 size={16} />
        </IconButton>
        <IconButton label={`Redo (${MOD}Shift+Z)`} disabled={!canRedo} onClick={() => useBoardStore.getState().redo()}>
          <Redo2 size={16} />
        </IconButton>
        <Divider />
        {/* Desktop: direct buttons. Phones: tucked into a "more" menu to leave room for the title. */}
        <div className="hidden items-center gap-1 md:flex">
          <IconButton label="Export board as JSON" onClick={exportJson}>
            <Download size={16} />
          </IconButton>
          <IconButton label="Import board from JSON" onClick={openImport}>
            <Upload size={16} />
          </IconButton>
          <IconButton label="Clear board" disabled={isEmpty} onClick={confirmClear} className="hover:!bg-red-50 hover:!text-red-600">
            <Eraser size={16} />
          </IconButton>
        </div>
        <MoreMenu
          className="md:hidden"
          items={[
            { label: 'Export JSON', icon: <Download size={16} />, onSelect: exportJson },
            { label: 'Import JSON', icon: <Upload size={16} />, onSelect: openImport },
            { label: 'Clear board', icon: <Eraser size={16} />, onSelect: confirmClear, disabled: isEmpty, danger: true },
          ]}
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          data-testid="import-input"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = '' // allow re-importing the same file
            if (file) void importFile(file)
          }}
        />
      </FloatingPanel>
    </Panel>
  )
}
