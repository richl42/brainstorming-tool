import { useEffect, useRef, type ReactNode } from 'react'

interface DialogProps {
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
  width?: string
}

/** Accessible modal: focus moves inside, Escape and backdrop click close it. */
export function Dialog({ title, children, onClose, footer, width = 'max-w-sm' }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current
    // Focus [data-autofocus] (e.g. Cancel in destructive dialogs), else the primary (last) action.
    const footerButtons = el?.querySelectorAll<HTMLButtonElement>('footer button')
    const target = el?.querySelector<HTMLElement>('[data-autofocus]') ?? footerButtons?.[footerButtons.length - 1] ?? el
    target?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
      // Keep Tab inside the dialog.
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')]
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.({ preventScroll: true })
    }
  }, [onClose])

  return (
    <div className="dialog-backdrop fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 p-4" onMouseDown={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className={`dialog-panel w-full ${width} rounded-2xl border border-black/5 bg-white p-5 shadow-xl outline-none`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="dialog-title" className="text-base font-semibold text-gray-900">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-gray-600">{children}</div>
        {footer && <footer className="mt-5 flex justify-end gap-2">{footer}</footer>}
      </div>
    </div>
  )
}

export function DialogButton({
  children,
  onClick,
  variant = 'secondary',
  autoFocus,
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  autoFocus?: boolean
}) {
  const styles = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      data-autofocus={autoFocus || undefined}
      className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none ${styles}`}
    >
      {children}
    </button>
  )
}
