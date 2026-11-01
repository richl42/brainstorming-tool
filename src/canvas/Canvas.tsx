import { useState } from 'react'
import { Background, BackgroundVariant, MiniMap, ReactFlow } from '@xyflow/react'
import { MAX_ZOOM, MIN_ZOOM } from './constants'
import { ZoomControls } from '../ui/ZoomControls'
import { MinimapToggle } from '../ui/MinimapToggle'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export function Canvas() {
  const [showMinimap, setShowMinimap] = useState(() => window.innerWidth >= 768)

  return (
    <div className="h-full w-full bg-canvas">
      <ReactFlow
        nodes={[]}
        edges={[]}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        // Pan: drag empty space, Space + drag, or two-finger trackpad scroll.
        panOnDrag
        panActivationKeyCode="Space"
        panOnScroll
        // Zoom: Ctrl/Cmd + wheel and trackpad pinch (pinch arrives as ctrl+wheel),
        // always centred on the cursor.
        zoomOnScroll={false}
        zoomOnPinch
        zoomActivationKeyCode={isMac ? 'Meta' : 'Control'}
        zoomOnDoubleClick={false}
        // Shift + drag on empty canvas draws a selection box.
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
        attributionPosition="bottom-center"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--color-dot)" />
        {showMinimap && (
          <MiniMap
            position="bottom-left"
            style={{ marginBottom: 60 }}
            pannable
            zoomable
            maskColor="rgb(247 246 243 / 0.7)"
            nodeBorderRadius={6}
          />
        )}
        <MinimapToggle visible={showMinimap} onToggle={() => setShowMinimap((v) => !v)} />
        <ZoomControls />
      </ReactFlow>
    </div>
  )
}
