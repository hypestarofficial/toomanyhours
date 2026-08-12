import type { IGDBGame, UserGame } from "../../../api/generated/models"
import { ADD_ON_KINDS } from "../../../list/visibleEntries"

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
 * The add-ons of one game that are in this list.
 *
 * The read-only counterpart to DlcList, and deliberately not the same source.
 * DlcList asks IGDB, because its job is to show you add-ons you have *not*
 * added. A visitor to somebody's profile wants the opposite — what that person
 * actually played — and that is already in the entries the page loaded. It
 * also could not ask IGDB if it wanted to: `/games/:igdbId/dlcs` sits behind
 * AuthRequired and a visitor has no token.
 *
 * These are exactly the entries visibleEntries hides from the list, put back
 * under the game they belong to.
 */
export const addOnsOf = (parent: UserGame | null | undefined, entries: UserGame[]): UserGame[] => {
  const parentIgdbId = parent?.game?.igdbId
  if (parentIgdbId == null) return []

  return entries.filter((candidate) => {
    const game = candidate.game
    if (!game) return false
    if (!ADD_ON_KINDS.has(game.kind)) return false

    return game.parentIgdbId === parentIgdbId
  })
}

/**
 * An add-on's title with its parent's name taken off the front.
 *
 * IGDB names add-ons in full — "Payday 2: The Diamond Store Heist", "The
 * Witcher 3: Wild Hunt - Blood and Wine" — so a list of ten under their parent
 * repeats the same words ten times and buries the part that differs.
 *
 * Matches the parent's *title* as a prefix rather than splitting on
 * punctuation, which is the whole difficulty. "The Witcher 3: Wild Hunt - New
 * Quest: Scavenger Hunt: Wolf School Gear" has three colons; splitting on the
 * first would leave "Wild Hunt - New Quest...", which is worse than doing
 * nothing.
 *
 * Falls back to the full title whenever stripping would leave nothing, or when
 * the add-on is not named after its parent at all — some are not, and inventing
 * a shorter name for them is not this function's job.
 */
export const stripParentTitle = (title: string, parentTitle?: string): string => {
  if (!parentTitle) return title
  if (!title.toLowerCase().startsWith(parentTitle.toLowerCase())) return title

  // Whatever punctuation joined the two: ": ", " - ", " – ", " — ".
  const rest = title.slice(parentTitle.length).replace(/^[\s:–—-]+/, "")

  return rest || title
}
