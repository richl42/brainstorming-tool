/** Pastel sticky-note palette. Cards store the colour *id*, not the hex. */
export const CARD_COLORS = {
  yellow: { label: 'Yellow', bg: '#fff1a8', border: '#efd96a' },
  orange: { label: 'Peach', bg: '#ffdcc2', border: '#f2bb92' },
  pink: { label: 'Pink', bg: '#ffd5e1', border: '#f2a9be' },
  purple: { label: 'Lavender', bg: '#e5dcff', border: '#c4b3f5' },
  blue: { label: 'Blue', bg: '#d4e5ff', border: '#a7c5f2' },
  teal: { label: 'Mint', bg: '#c8efe8', border: '#93d6ca' },
  green: { label: 'Green', bg: '#d6f2c9', border: '#a9dc93' },
  gray: { label: 'Grey', bg: '#ebeae6', border: '#cfcdc6' },
} as const

export type CardColor = keyof typeof CARD_COLORS

export const CARD_COLOR_IDS = Object.keys(CARD_COLORS) as CardColor[]
export const DEFAULT_CARD_COLOR: CardColor = 'yellow'

export function isCardColor(value: unknown): value is CardColor {
  return typeof value === 'string' && value in CARD_COLORS
}
