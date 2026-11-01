import { Dialog, DialogButton } from './Dialog'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl'

const GROUPS: { title: string; items: [string, string[]][] }[] = [
  {
    title: 'Cards',
    items: [
      ['New card', ['N']],
      ['New card here', ['Double-click canvas']],
      ['Edit selected card', ['Enter']],
      ['Stop editing', ['Esc']],
      ['Duplicate', [MOD, 'D']],
      ['Delete', ['Delete']],
    ],
  },
  {
    title: 'Selection',
    items: [
      ['Add / remove from selection', ['Shift', 'Click']],
      ['Select an area', ['Shift', 'Drag']],
      ['Select all', [MOD, 'A']],
      ['Deselect', ['Esc']],
    ],
  },
  {
    title: 'History',
    items: [
      ['Undo', [MOD, 'Z']],
      ['Redo', [MOD, 'Shift', 'Z']],
    ],
  },
  {
    title: 'View',
    items: [
      ['Pan', ['Drag canvas']],
      ['Pan', ['Space', 'Drag']],
      ['Zoom', [MOD, 'Scroll']],
      ['Fit all cards', ['Shift', '1']],
      ['Show shortcuts', ['?']],
    ],
  },
]

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      title="Keyboard shortcuts"
      onClose={onClose}
      width="max-w-xl"
      footer={
        <DialogButton variant="primary" onClick={onClose}>
          Done
        </DialogButton>
      }
    >
      <div className="mt-3 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">{group.title}</h3>
            <dl className="space-y-1.5">
              {group.items.map(([label, keys]) => (
                <div key={label + keys.join()} className="flex items-center justify-between gap-3">
                  <dt className="text-gray-700">{label}</dt>
                  <dd className="flex shrink-0 gap-1">
                    {keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-sans text-xs text-gray-600 shadow-[0_1px_0_rgb(0_0_0/0.06)]"
                      >
                        {k}
                      </kbd>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
