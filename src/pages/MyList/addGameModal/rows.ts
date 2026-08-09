import type { UserGame } from "../../../api/generated/models"

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

/**
 * The IGDB ids already in the user's list.
 *
 * Read from the cached /me/games query, so knowing what you own costs no
 * request — the list is already loaded for the page behind the modal.
 */
export const ownedIgdbIds = (entries: UserGame[] | undefined): Set<number> => {
  const ids = new Set<number>()

  for (const entry of entries ?? []) {
    // `game` is optional in the generated types because the schema says so.
    if (entry.game) {
      ids.add(entry.game.igdbId)
    }
  }

  return ids
}

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
