import type { UserGame } from "../api/generated/models"

/**
 * Whether an entry survives the current search and genre filters.
 *
 * Pure, and separate from the component, because this is the only real logic
 * in MyList's filtering — everything else is a useMemo and some JSX.
 *
 * Filtering runs in the browser rather than the API: the whole list is already
 * loaded, and a pass over 500 entries measures ~14 microseconds against a 4ms
 * round trip. See the design doc.
 */
export const matchesFilters = (entry: UserGame, search: string, genreIDs: number[]): boolean => {
  const needle = search.trim().toLowerCase()

  // `game` is optional in the generated types because the schema says so. An
  // entry without one cannot match any filter, but must not throw either.
  if (needle) {
    const title = entry.game?.title?.toLowerCase()
    if (!title || !title.includes(needle)) {
      return false
    }
  }

  if (genreIDs.length > 0) {
    // `genres` is omitted entirely when a game has none, so this is a real
    // shape rather than defensive padding.
    const genres = entry.game?.genres
    if (!genres?.some((genre) => genreIDs.includes(genre.id))) {
      return false
    }
  }

  return true
}
