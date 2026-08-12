/**
 * What the picker may do with one search result.
 *
 * A pure function rather than conditions tangled in JSX, because owned and
 * selected interact and that interaction is where the bug goes.
 */
export const ROW_STATE = {
  OWNED: "owned",
  SELECTED: "selected",
  SELECTABLE: "selectable",
} as const

export type ROW_STATE = (typeof ROW_STATE)[keyof typeof ROW_STATE]

export const rowState = (igdbId: number, owned: Set<number>, selectedIgdbId: number | null): ROW_STATE => {
  // Owned wins over everything. A game already listed is not selectable, and
  // adding a duplicate is a 409.
  if (owned.has(igdbId)) {
    return ROW_STATE.OWNED
  }
  if (selectedIgdbId === igdbId) {
    return ROW_STATE.SELECTED
  }
  return ROW_STATE.SELECTABLE
}
