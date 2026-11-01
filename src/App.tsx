import { useEffect, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Canvas } from './canvas/Canvas'
import { useBoardStore } from './store/boardStore'
import { storage } from './storage'
import { useAutosave } from './hooks/useAutosave'
import { SaveIndicator } from './ui/SaveIndicator'
import { DialogHost } from './ui/DialogHost'

export default function App() {
  const [ready, setReady] = useState(false)

  // Hydrate the store from storage before mounting the canvas, so the
  // camera starts exactly where the user left it.
  useEffect(() => {
    let cancelled = false
    storage
      .loadCurrent()
      .then((board) => {
        if (!cancelled && board) useBoardStore.getState().loadBoard(board)
      })
      .catch((err) => console.warn('Could not load the saved board.', err))
      .finally(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) return null
  return <Board />
}

function Board() {
  useAutosave()
  return (
    <ReactFlowProvider>
      <Canvas />
      <SaveIndicator />
      <DialogHost />
    </ReactFlowProvider>
  )
}
