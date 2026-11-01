/**
 * Board-level commands shared by the toolbar, keyboard shortcuts and dialogs.
 */
import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import type { Board } from '../model/types'
import { useBoardStore } from '../store/boardStore'
import { useUiStore } from '../store/uiStore'
import { boardFromJson, boardToJson, BoardParseError } from '../storage/serialize'

const FIT_OPTIONS = { padding: 0.2, duration: 300, maxZoom: 1.5 }

function fileNameFor(title: string) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${slug || 'board'}.json`
}

export function useBoardCommands() {
  const { fitView, setViewport } = useReactFlow()

  const fitAll = useCallback(() => void fitView(FIT_OPTIONS), [fitView])

  const exportJson = useCallback(() => {
    const board = useBoardStore.getState().getBoard()
    const blob = new Blob([boardToJson(board)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileNameFor(board.title)
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [])

  /** Replace the current board with an imported one, camera included. */
  const applyImport = useCallback(
    (board: Board) => {
      useBoardStore.getState().loadBoard(board)
      void setViewport(board.viewport)
    },
    [setViewport],
  )

  const importFile = useCallback(
    async (file: File) => {
      const { openDialog } = useUiStore.getState()
      try {
        const board = boardFromJson(await file.text())
        if (Object.keys(useBoardStore.getState().cards).length > 0) openDialog({ kind: 'confirm-import', board })
        else applyImport(board)
      } catch (err) {
        openDialog({
          kind: 'error',
          title: 'Couldn’t import that file',
          message:
            err instanceof BoardParseError ? err.message : 'The file could not be read. Choose a .json file exported from this app.',
        })
      }
    },
    [applyImport],
  )

  return { fitAll, exportJson, importFile, applyImport }
}
