import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  active?: boolean
  children: ReactNode
}

/** Square icon button used in all floating toolbars. */
export function IconButton({ label, active, children, className = '', ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-gray-600 transition-colors
        hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 disabled:pointer-events-none disabled:opacity-35
        ${active ? 'bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/** White floating container with soft shadow. */
export function FloatingPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 rounded-xl border border-black/5 bg-white p-1 shadow-float ${className}`}>
      {children}
    </div>
  )
}
