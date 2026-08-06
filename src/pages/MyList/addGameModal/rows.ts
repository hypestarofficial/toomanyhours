import type { UserGame } from "../../../api/generated/models"

/**
 * What the picker may do with one search result.
 *
 * A pure function rather than three conditions tangled in JSX, because owned,
 * selected and at-the-cap interact and that interaction is where the bug goes.
 */
export const ROW_STATE = {
  OWNED: "owned",
  SELECTED: "selected",
  SELECTABLE: "selectable",
  BLOCKED: "blocked",
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

export const rowState = (igdbId: number, owned: Set<number>, selected: number[], max: number): ROW_STATE => {
  // Owned wins over everything. A game already listed is not selectable no
  // matter what else is true, and adding a duplicate fails the whole request
  // with a 409 rather than just that one game.
  if (owned.has(igdbId)) {
    return ROW_STATE.OWNED
  }
  if (selected.includes(igdbId)) {
    return ROW_STATE.SELECTED
  }
  if (selected.length >= max) {
    return ROW_STATE.BLOCKED
  }
  return ROW_STATE.SELECTABLE
}
