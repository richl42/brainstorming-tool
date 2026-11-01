/** Last known pointer position over the canvas (client coords), or null if outside. */
export const lastCanvasPointer: { current: { x: number; y: number } | null } = { current: null }

const DOUBLE_TAP_MS = 350
const DOUBLE_TAP_SLOP_PX = 24
/** Native dblclick events arriving this soon after a handled double-tap are duplicates. */
const DUPLICATE_DBLCLICK_MS = 600

let lastTap: { time: number; x: number; y: number } | null = null
let lastDoubleTapAt = 0

/**
 * Feed touch pointer-ups in; returns true when this tap completes a double-tap.
 * (Mobile browsers don't reliably fire `dblclick` for touch, so we detect it.)
 */
export function registerTap(x: number, y: number, time = performance.now()): boolean {
  const isDouble =
    lastTap !== null &&
    time - lastTap.time < DOUBLE_TAP_MS &&
    Math.hypot(x - lastTap.x, y - lastTap.y) < DOUBLE_TAP_SLOP_PX
  if (isDouble) {
    lastTap = null
    lastDoubleTapAt = time
  } else {
    lastTap = { time, x, y }
  }
  return isDouble
}

/** True if a native dblclick should be ignored because a touch double-tap already handled it. */
export function isDuplicateDoubleClick(time = performance.now()) {
  return time - lastDoubleTapAt < DUPLICATE_DBLCLICK_MS
}

/** Taps that turn into drags/pans must not count towards a double-tap. */
export function resetTap() {
  lastTap = null
}
