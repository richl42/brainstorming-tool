import { useCallback } from 'react'
import { useUiStore } from '../store/uiStore'
import { useBoardStore } from '../store/boardStore'
import { useBoardCommands } from '../canvas/useBoardCommands'
import { Dialog, DialogButton } from './Dialog'
import { ShortcutsDialog } from './ShortcutsDialog'

/** Renders whichever dialog is open in the UI store. */
export function DialogHost() {
  const dialog = useUiStore((s) => s.dialog)
  const close = useCallback(() => useUiStore.getState().closeDialog(), [])
  const { applyImport } = useBoardCommands()

  if (!dialog) return null

  switch (dialog.kind) {
    case 'shortcuts':
      return <ShortcutsDialog onClose={close} />

    case 'confirm-clear': {
      const count = Object.keys(useBoardStore.getState().cards).length
      return (
        <Dialog
          title="Clear the board?"
          onClose={close}
          footer={
            <>
              <DialogButton onClick={close} autoFocus>
                Cancel
              </DialogButton>
              <DialogButton
                variant="danger"
                onClick={() => {
                  useBoardStore.getState().clearBoard()
                  close()
                }}
              >
                Clear board
              </DialogButton>
            </>
          }
        >
          This removes all {count} {count === 1 ? 'card' : 'cards'}. You can bring them back with Undo.
        </Dialog>
      )
    }

    case 'confirm-import':
      return (
        <Dialog
          title="Replace this board?"
          onClose={close}
          footer={
            <>
              <DialogButton onClick={close} autoFocus>
                Cancel
              </DialogButton>
              <DialogButton
                variant="primary"
                onClick={() => {
                  applyImport(dialog.board)
                  close()
                }}
              >
                Replace
              </DialogButton>
            </>
          }
        >
          “{dialog.board.title}” has {dialog.board.cards.length} {dialog.board.cards.length === 1 ? 'card' : 'cards'}. It
          will replace what’s on the canvas now. Export the current board first if you want to keep a copy.
        </Dialog>
      )

    case 'error':
      return (
        <Dialog title={dialog.title} onClose={close} footer={<DialogButton variant="primary" onClick={close}>OK</DialogButton>}>
          {dialog.message}
        </Dialog>
      )
  }
}
