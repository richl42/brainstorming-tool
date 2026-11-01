import { useCallback, useState, type MouseEvent, type PointerEvent } from 'react'
import { Background, BackgroundVariant, MiniMap, ReactFlow, type NodeTypes } from '@xyflow/react'
import { MAX_ZOOM, MIN_ZOOM } from './constants'
import { applyNodeChangesToStore, useCardNodes, type CardFlowNode } from './adapters'
import { CardNode } from './CardNode'
import { lastCanvasPointer } from './pointer'
import { useCreateCard } from './useCreateCard'
import { CARD_COLORS } from '../model/colors'
import { useBoardStore } from '../store/boardStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { ZoomControls } from '../ui/ZoomControls'
import { MinimapToggle } from '../ui/MinimapToggle'
import { Toolbar } from '../ui/Toolbar'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const nodeTypes: NodeTypes = { card: CardNode }
const minimapColor = (n: CardFlowNode) => CARD_COLORS[n.data.card.color].border

export function Canvas() {
  const [showMinimap, setShowMinimap] = useState(() => window.innerWidth >= 768)
  const nodes = useCardNodes()
  const createCard = useCreateCard()
  useKeyboardShortcuts()

  const onDoubleClick = useCallback(
    (e: MouseEvent) => {
      // Only empty canvas; double-clicking a card is handled by the card itself.
      if (!(e.target as Element).classList.contains('react-flow__pane')) return
      createCard({ clientX: e.clientX, clientY: e.clientY })
    },
    [createCard],
  )

  // React Flow's pan handler swallows mousedown, so a click on the canvas would not
  // blur the card being edited. End editing explicitly on any outside pointer down.
  const onPointerDownCapture = useCallback((e: PointerEvent) => {
    if (useBoardStore.getState().editingId && !(e.target as Element).closest('[data-editing]')) {
      useBoardStore.getState().stopEditing()
    }
  }, [])

  return (
    <div
      className="h-full w-full bg-canvas"
      onDoubleClick={onDoubleClick}
      onPointerDownCapture={onPointerDownCapture}
      onPointerMove={(e) => (lastCanvasPointer.current = { x: e.clientX, y: e.clientY })}
      onPointerLeave={() => (lastCanvasPointer.current = null)}
    >
      <ReactFlow<CardFlowNode>
        nodes={nodes}
        edges={[]}
        nodeTypes={nodeTypes}
        onNodesChange={applyNodeChangesToStore}
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
        // We own z-order (card.zIndex); don't let React Flow bump selected nodes.
        elevateNodesOnSelect={false}
        // Only render cards in view — keeps big boards fast.
        onlyRenderVisibleElements
        attributionPosition="bottom-center"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.6} color="var(--color-dot)" />
        {showMinimap && (
          <MiniMap<CardFlowNode>
            position="bottom-left"
            style={{ marginBottom: 60 }}
            pannable
            zoomable
            nodeColor={minimapColor}
            maskColor="rgb(247 246 243 / 0.7)"
            nodeBorderRadius={6}
          />
        )}
        <MinimapToggle visible={showMinimap} onToggle={() => setShowMinimap((v) => !v)} />
        <Toolbar />
        <ZoomControls />
      </ReactFlow>
    </div>
  )
}
