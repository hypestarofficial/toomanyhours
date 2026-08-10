import type { IGDBGame, UserGame } from "../../../api/generated/models"
import { ADD_ON_KINDS } from "../visibleEntries"
import { LIST_TYPE } from "../../../helpers/enums"

export type DlcRow = {
  igdbId: number
  /** The list entry for this add-on, when you already have it. */
  entry: UserGame | undefined
  /** Its current category, so the matching button renders as active. */
  category: string | undefined
}

/**
 * Pairs one IGDB add-on with your list entry for it, if any.
 *
 * Pure because the pairing is the only real logic in the row: the IGDB result
 * and the list entry are two different shapes keyed on two different ids, and
 * matching the wrong one would half-work rather than fail.
 */
export const dlcRow = (game: IGDBGame, entries: UserGame[]): DlcRow => {
  // igdbId on both sides. entry.gameId is the surrogate catalog key and means
  // nothing to IGDB.
  const entry = entries.find((candidate) => candidate.game?.igdbId === game.igdbId)

  return { igdbId: game.igdbId, entry, category: entry?.category }
}

/**
 * Whether a row should open the add-on's own card.
 *
 * Only for something you have played or are playing. A want-to-play card shows
 * no rating and no review — `gameCardMode` puts those two categories in EDIT
 * and FINISH and leaves PLAY with neither — and an add-on has no add-on list of
 * its own either, so opening one lands you on an empty screen. The three
 * category buttons already do everything that card could offer.
 *
 * A row you do not own is not openable for the plainer reason that there is no
 * entry to open.
 */
export const canOpenAddOn = (category: string | undefined): boolean =>
  category === LIST_TYPE.FINISHED || category === LIST_TYPE.CURRENTLY_PLAYING

/**
 * The list entry for the game this add-on belongs to, when you have it.
 *
 * What the card's "back" control needs. Opening an add-on from its parent
 * replaces the modal's subject, and without a way back, rating three DLCs in a
 * row means reopening the parent three times.
 *
 * Returns undefined for anything that is not an add-on, so a remaster never
 * offers to take you "back" to the original it merely descends from — the same
 * kind rule the list hides by, and imported rather than restated so the two
 * cannot drift.
 */
export const parentEntryOf = (entry: UserGame | null | undefined, entries: UserGame[]): UserGame | undefined => {
  const game = entry?.game
  if (!game) return undefined
  if (!ADD_ON_KINDS.has(game.kind)) return undefined
  if (game.parentIgdbId == null) return undefined

  return entries.find((candidate) => candidate.game?.igdbId === game.parentIgdbId)
}
