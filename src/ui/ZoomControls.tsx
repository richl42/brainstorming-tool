import { Panel, useReactFlow, useStore } from '@xyflow/react'
import { Maximize, Minus, Plus } from 'lucide-react'
import { FloatingPanel, IconButton } from './IconButton'
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP_DURATION } from '../canvas/constants'

const zoomSelector = (s: { transform: [number, number, number] }) => s.transform[2]

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView, zoomTo } = useReactFlow()
  const zoom = useStore(zoomSelector)
  const pct = Math.round(zoom * 100)

  return (
    <Panel position="bottom-right" className="!m-4">
      <FloatingPanel>
        <IconButton label="Zoom out" onClick={() => zoomOut({ duration: ZOOM_STEP_DURATION })} disabled={zoom <= MIN_ZOOM + 1e-3}>
          <Minus size={16} />
        </IconButton>
        <button
          type="button"
          title="Reset to 100%"
          aria-label="Reset zoom to 100%"
          onClick={() => zoomTo(1, { duration: ZOOM_STEP_DURATION })}
          className="h-8 w-14 rounded-lg text-xs font-medium tabular-nums text-gray-700 hover:bg-gray-100"
        >
          {pct}%
        </button>
        <IconButton label="Zoom in" onClick={() => zoomIn({ duration: ZOOM_STEP_DURATION })} disabled={zoom >= MAX_ZOOM - 1e-3}>
          <Plus size={16} />
        </IconButton>
        <div className="mx-0.5 h-5 w-px bg-gray-200" />
        <IconButton label="Fit all cards (Shift+1)" onClick={() => fitView({ padding: 0.2, duration: 300, maxZoom: 1.5 })}>
          <Maximize size={15} />
        </IconButton>
      </FloatingPanel>
    </Panel>
  )
}
