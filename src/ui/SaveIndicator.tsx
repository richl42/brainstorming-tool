import { Check, CloudAlert, LoaderCircle } from 'lucide-react'
import { useSaveStatus } from '../storage/saveStatus'

/** Small "Saved" status in the top-left corner. */
export function SaveIndicator() {
  const { status, error } = useSaveStatus()

  return (
    <div
      className={`pointer-events-none fixed top-[68px] left-4 z-10 md:top-4 flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors ${
        status === 'error' ? 'bg-red-50 text-red-700 shadow-float' : 'text-gray-500'
      }`}
      role="status"
      aria-live="polite"
      data-status={status}
    >
      {status === 'saved' && (
        <>
          <Check size={14} strokeWidth={2.25} /> Saved
        </>
      )}
      {status === 'pending' && (
        <>
          <LoaderCircle size={14} className="animate-spin" /> Saving…
        </>
      )}
      {status === 'error' && (
        <>
          <CloudAlert size={14} /> {error ?? 'Not saved'}
        </>
      )}
    </div>
  )
}
