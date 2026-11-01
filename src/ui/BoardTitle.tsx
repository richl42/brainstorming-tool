import { useState } from 'react'
import { useBoardStore } from '../store/boardStore'

/** Inline-editable board title that sizes itself to its text. */
export function BoardTitle() {
  const title = useBoardStore((s) => s.title)
  const [draft, setDraft] = useState<string | null>(null)
  const value = draft ?? title

  const commit = () => {
    if (draft !== null) useBoardStore.getState().setTitle(draft)
    setDraft(null)
  }

  return (
    // Grid trick: an invisible copy of the text sizes the input.
    <label className="board-title inline-grid min-w-0 flex-1 md:max-w-64 md:flex-none" data-value={value || ' '}>
      <span className="sr-only">Board title</span>
      <input
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(null)
            // Blur after the reset so the original title is kept.
            requestAnimationFrame(() => (e.target as HTMLInputElement).blur())
          }
        }}
        size={1}
        maxLength={120}
        spellCheck={false}
        title="Rename board"
        className="h-8 w-full min-w-0 truncate rounded-lg bg-transparent px-2 text-sm font-semibold text-gray-800 outline-none hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-accent/40"
      />
    </label>
  )
}
