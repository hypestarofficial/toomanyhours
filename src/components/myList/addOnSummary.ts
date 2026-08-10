/** How many add-ons a tooltip lists before it stops naming them. */
export const ADD_ON_TOOLTIP_MAX = 10

export type AddOnSummary = {
  /** The titles to print, at most ADD_ON_TOOLTIP_MAX of them. */
  titles: string[]
  /** How many were left unnamed. 0 when everything fit. */
  remaining: number
}

/**
 * What a card's add-on tooltip should say.
 *
 * A cap rather than the whole list, because a tooltip taller than the window
 * is worse than one that admits it stopped: Dave the Diver alone would print a
 * dozen lines. The overflow is counted rather than dropped, so the tooltip
 * never quietly under-reports what you have.
 *
 * Pure because the boundary is the only rule here, and an off-by-one at the
 * cap is invisible until exactly eleven of something exists.
 */
export const addOnSummary = (titles: string[], max: number = ADD_ON_TOOLTIP_MAX): AddOnSummary => ({
  titles: titles.slice(0, max),
  remaining: Math.max(0, titles.length - max),
})
