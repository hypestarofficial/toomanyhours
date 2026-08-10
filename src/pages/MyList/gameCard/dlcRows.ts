import type { IGDBGame, UserGame } from "../../../api/generated/models"

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
