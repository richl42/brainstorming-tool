import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { IconButton } from './IconButton'

export interface MenuItem {
  label: string
  icon: ReactNode
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
}

/** Compact overflow menu (used on small screens). */
export function MoreMenu({ items, className = '' }: { items: MenuItem[]; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <IconButton label="More actions" aria-haspopup="menu" aria-expanded={open} active={open} onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal size={16} />
      </IconButton>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-20 mt-2 w-48 rounded-xl border border-black/5 bg-white p-1 shadow-float">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className={`flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm disabled:opacity-35 ${
                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
