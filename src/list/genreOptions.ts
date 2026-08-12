import type { UserGame } from "../api/generated/models"

/**
 * The genres worth offering as a filter for one profile: the ones its own
 * games actually have, sorted by name.
 *
 * Derived from the entries rather than fetched, because `GET /genres` sits
 * behind AuthRequired and this page is the one route a visitor with no account
 * can reach. It is also the better list: on a profile of forty games, the full
 * IGDB set would offer twenty genres of which a dozen match nothing.
 *
 * Both list pages use this. MyList did fetch `GET /genres` instead, which is
 * why that endpoint existed; deriving here left it with no caller and it was
 * deleted rather than left to drift out of step with the schema.
 *
 * Callers pass `visibleEntries(entries)`, not the raw list: a genre carried
 * only by an add-on hidden under its owned parent would otherwise appear as an
 * option that matches nothing.
 */
export const genreOptions = (entries: UserGame[]): { label: string; value: number }[] => {
  const byID = new Map<number, string>()

  for (const entry of entries) {
    // `game` is optional in the generated types and `genres` is omitted for a
    // game with none. Both are shapes the API really produces.
    for (const genre of entry.game?.genres ?? []) {
      byID.set(genre.id, genre.name)
    }
  }

  return [...byID.entries()].map(([value, label]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label))
}
