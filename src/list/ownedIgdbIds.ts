import type { UserGame } from "../api/generated/models"

/**
 * The IGDB ids already in a user's list.
 *
 * Read from the cached /me/games query, so knowing what you own costs no
 * request — the list is already loaded for the page behind the modal.
 *
 * It lives here rather than beside the Add Game picker because two unrelated
 * features need it: the picker greys out what you already have, and
 * visibleEntries uses it to decide whether an add-on's parent is present.
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
