import type { UserGame } from "../../api/generated/models"
import { ownedIgdbIds } from "./addGameModal/rows"

/**
 * The two kinds that belong to a game rather than standing beside it.
 *
 * Deliberately not "anything with a parentIgdbId". IGDB sets a parent on
 * remasters, bundles and expanded games too — Skyrim Special Edition points at
 * Skyrim, and Grand Theft Auto V Enhanced at Grand Theft Auto V — and each of
 * those is the release somebody actually played. Widening this rule would
 * delete them from the list the day their base game was added.
 *
 * The same two kinds are excluded from IGDB search, and that is not a
 * coincidence: an add-on is found through its parent or not at all.
 */
const ADD_ON_KINDS = new Set(["dlc", "expansion"])

/**
 * The entries the list should render.
 *
 * An add-on is hidden only when there is somewhere else to find it — its
 * parent's card. Own the add-on but not the parent and it stays an ordinary
 * top-level entry, because otherwise it would simply be gone.
 *
 * Pure and separate from the components because two pages need it: your list
 * and the public profile, where a stranger should see a list of games rather
 * than a wall of Borderlands packs.
 */
export const visibleEntries = (entries: UserGame[]): UserGame[] => {
  const owned = ownedIgdbIds(entries)

  return entries.filter((entry) => {
    const game = entry.game
    // `game` is optional in the generated types because the schema says so. An
    // entry without one cannot be judged, and dropping it would hide a row for
    // the wrong reason.
    if (!game) return true
    if (!ADD_ON_KINDS.has(game.kind)) return true
    if (game.parentIgdbId == null) return true

    return !owned.has(game.parentIgdbId)
  })
}
