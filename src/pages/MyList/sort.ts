import type { UserGame } from "../../api/generated/models"

/**
 * How MyList is ordered. Three fields, no more: the wishlist entry said
 * "Rating, Name, Added, Date added", where the last two named the same column.
 */
export const SORT_FIELD = {
  RATING: "rating",
  NAME: "name",
  ADDED: "added",
} as const

export type SORT_FIELD = (typeof SORT_FIELD)[keyof typeof SORT_FIELD]

export const SORT_DIRECTION = {
  ASC: "asc",
  DESC: "desc",
} as const

export type SORT_DIRECTION = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION]

export const SORT_LABEL: Record<SORT_FIELD, string> = {
  [SORT_FIELD.RATING]: "Rating",
  [SORT_FIELD.NAME]: "Name",
  [SORT_FIELD.ADDED]: "Added",
}

/**
 * The direction a field is picked in. Carrying a direction across fields means
 * an ascending chosen for Name silently becomes worst-games-first on Rating.
 */
export const NATURAL_DIRECTION: Record<SORT_FIELD, SORT_DIRECTION> = {
  [SORT_FIELD.RATING]: SORT_DIRECTION.DESC,
  [SORT_FIELD.NAME]: SORT_DIRECTION.ASC,
  [SORT_FIELD.ADDED]: SORT_DIRECTION.DESC,
}

/** Plain comparison, for ISO 8601 timestamps, where it is already chronological. */
const compareStrings = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/**
 * Whether this entry has nothing to sort by. Such entries sink, and they sink
 * in both directions — see sortEntries.
 */
const isMissing = (entry: UserGame, field: SORT_FIELD): boolean => {
  if (field === SORT_FIELD.RATING) return entry.rating == null
  if (field === SORT_FIELD.NAME) return !entry.game?.title
  return false // createdAt is required by the schema and always present.
}

/** Every comparator expressed ascending; the direction flips the result. */
const compareAscending = (a: UserGame, b: UserGame, field: SORT_FIELD): number => {
  if (field === SORT_FIELD.RATING) return (a.rating ?? 0) - (b.rating ?? 0)
  if (field === SORT_FIELD.NAME) return (a.game?.title ?? "").localeCompare(b.game?.title ?? "")
  return compareStrings(a.createdAt, b.createdAt)
}

/**
 * MyList's order, applied per section after filtering.
 *
 * In the browser rather than the API for the same reason matchesFilters is:
 * the whole list is already loaded, and a server-side sort would need a
 * loading state and out-of-order guarding to end up slower. This flips only if
 * MyList ever paginates, at which point filtering has to move too.
 *
 * Two rules here look like bugs and are not:
 *
 * Entries with nothing to sort by sink to the bottom **in both directions**.
 * If an unrated entry sorted as a rating of zero, ascending would put every
 * unrated game first — and `currently playing` and `want to play` hold no
 * ratings at all, so both would appear to ignore the sort entirely.
 *
 * The createdAt tiebreaker **does not flip** either. Ascending by rating
 * should reverse the rated games, not also reverse the unrated block at the
 * bottom, which has no rating to be ascending about. Without any tiebreaker,
 * ties would fall to the incoming array order — and in `want to play` sorted
 * by rating, every entry ties.
 */
export const sortEntries = (entries: UserGame[], field: SORT_FIELD, direction: SORT_DIRECTION): UserGame[] => {
  const flip = direction === SORT_DIRECTION.ASC ? 1 : -1

  // A copy: the input is TanStack Query's cached array, and sorting it in
  // place would reorder the cache under every other consumer.
  return [...entries].sort((a, b) => {
    const aMissing = isMissing(a, field)
    const bMissing = isMissing(b, field)
    if (aMissing !== bMissing) return aMissing ? 1 : -1

    if (!aMissing) {
      const primary = compareAscending(a, b, field) * flip
      if (primary !== 0) return primary
    }

    return compareStrings(b.createdAt, a.createdAt)
  })
}
