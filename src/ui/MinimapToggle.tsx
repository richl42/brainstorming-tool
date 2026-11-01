import { Panel } from '@xyflow/react'
import { Map } from 'lucide-react'
import { FloatingPanel, IconButton } from './IconButton'

export function MinimapToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <Panel position="bottom-left" className="!m-4">
      <FloatingPanel>
        <IconButton label={visible ? 'Hide minimap' : 'Show minimap'} active={visible} onClick={onToggle}>
          <Map size={16} />
        </IconButton>
      </FloatingPanel>
    </Panel>
  )
}
