/**
 * Undo/redo history for the board document.
 *
 * Snapshots hold references to the immutable `cards` map and the title, so
 * recording a step is O(1) regardless of board size.
 *
 * Continuous interactions (drag, resize, typing) are wrapped in a *gesture*:
 * the pre-gesture snapshot is recorded lazily on the first real change, so
 * one gesture = one undo step, and a gesture that changes nothing (a plain
 * click) records nothing.
 */
import type { CardId, Card } from '../model/types'

export const HISTORY_LIMIT = 100

export interface DocSnapshot {
  cards: Record<CardId, Card>
  title: string
}

export type GestureKind = 'drag' | 'resize' | 'edit'

export class History {
  private past: DocSnapshot[] = []
  private future: DocSnapshot[] = []
  private gesture: { kind: GestureKind; snapshot: DocSnapshot; recorded: boolean } | null = null

  constructor(private limit = HISTORY_LIMIT) {}

  get canUndo() {
    return this.past.length > 0
  }
  get canRedo() {
    return this.future.length > 0
  }

  /**
   * Call before applying a document change, with the state *before* it.
   * Inside a gesture only the first change is recorded (with the gesture's
   * starting snapshot).
   */
  willChange(current: DocSnapshot) {
    if (this.gesture) {
      if (this.gesture.recorded) return
      this.gesture.recorded = true
      this.push(this.gesture.snapshot)
    } else {
      this.push(current)
    }
  }

  /** Start grouping changes. `alreadyRecorded` merges the gesture into the previous step. */
  beginGesture(kind: GestureKind, current: DocSnapshot, alreadyRecorded = false) {
    this.gesture = { kind, snapshot: current, recorded: alreadyRecorded }
  }

  /** End the current gesture if it is of the given kind. */
  endGesture(kind: GestureKind) {
    if (this.gesture?.kind === kind) this.gesture = null
  }

  get inGesture() {
    return this.gesture !== null
  }

  undo(current: DocSnapshot): DocSnapshot | null {
    this.gesture = null
    const prev = this.past.pop()
    if (!prev) return null
    this.future.push(current)
    return prev
  }

  redo(current: DocSnapshot): DocSnapshot | null {
    this.gesture = null
    const next = this.future.pop()
    if (!next) return null
    this.past.push(current)
    return next
  }

  clear() {
    this.past = []
    this.future = []
    this.gesture = null
  }

  private push(snapshot: DocSnapshot) {
    this.past.push(snapshot)
    if (this.past.length > this.limit) this.past.shift()
    this.future = []
  }
}
