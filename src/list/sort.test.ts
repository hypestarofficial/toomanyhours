import { describe, expect, it } from "vitest"
import { NATURAL_DIRECTION, SORT_DIRECTION, SORT_FIELD, sortEntries } from "./sort"
import type { UserGame } from "../api/generated/models"

type Fixture = { id: number; createdAt: string; rating?: number | null; title?: string | null }

const entry = ({ id, createdAt, rating = null, title = `Game ${id}` }: Fixture): UserGame =>
  ({
    id,
    gameId: id * 10,
    category: "finished",
    rating,
    review: null,
    createdAt,
    updatedAt: createdAt,
    game: title === null ? undefined : { id: id * 10, title, genres: [] },
  }) as unknown as UserGame

const ids = (entries: UserGame[]): number[] => entries.map((e) => e.id)

describe("sortEntries", () => {
  describe("rating", () => {
    it("puts the highest rating first when descending", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", rating: 6 }),
        entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", rating: 9.5 }),
        entry({ id: 3, createdAt: "2026-01-03T00:00:00Z", rating: 8 }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.DESC))).toEqual([2, 3, 1])
    })

    it("puts the lowest rating first when ascending", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", rating: 6 }),
        entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", rating: 9.5 }),
        entry({ id: 3, createdAt: "2026-01-03T00:00:00Z", rating: 8 }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.ASC))).toEqual([1, 3, 2])
    })

    // The rule most likely to be "simplified" away later. If null sorted as a
    // low number, ascending would put every unrated game first — and two of
    // the three sections hold no ratings at all, so both would look like the
    // sort had stopped working.
    it("keeps unrated entries at the bottom in BOTH directions", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", rating: null }),
        entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", rating: 9.5 }),
        entry({ id: 3, createdAt: "2026-01-03T00:00:00Z", rating: 4 }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.DESC))).toEqual([2, 3, 1])
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.ASC))).toEqual([3, 2, 1])
    })

    // The `want to play` section: every entry ties, so the tiebreaker is the
    // only thing deciding the order, and it must be today's order.
    it("falls back to newest-added when nothing is rated", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z" }),
        entry({ id: 2, createdAt: "2026-01-03T00:00:00Z" }),
        entry({ id: 3, createdAt: "2026-01-02T00:00:00Z" }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.DESC))).toEqual([2, 3, 1])
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.ASC))).toEqual([2, 3, 1])
    })

    // Two games rated the same are ordered by when they were added, and that
    // does not reverse with the direction button.
    it("breaks a rating tie by newest-added, unflipped", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", rating: 8 }),
        entry({ id: 2, createdAt: "2026-01-03T00:00:00Z", rating: 8 }),
        entry({ id: 3, createdAt: "2026-01-02T00:00:00Z", rating: 8 }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.DESC))).toEqual([2, 3, 1])
      expect(ids(sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.ASC))).toEqual([2, 3, 1])
    })
  })

  describe("name", () => {
    it("sorts A to Z when ascending and Z to A when descending", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", title: "Hades" }),
        entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", title: "Bloodborne" }),
        entry({ id: 3, createdAt: "2026-01-03T00:00:00Z", title: "Outer Wilds" }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.NAME, SORT_DIRECTION.ASC))).toEqual([2, 1, 3])
      expect(ids(sortEntries(list, SORT_FIELD.NAME, SORT_DIRECTION.DESC))).toEqual([3, 1, 2])
    })

    // A naive `a < b` puts every lowercase title after every uppercase one,
    // because it compares code points. localeCompare does not.
    it("is not case sensitive the way a code-point comparison is", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", title: "a Short Hike" }),
        entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", title: "Bloodborne" }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.NAME, SORT_DIRECTION.ASC))).toEqual([1, 2])
    })

    // `game` is optional in the generated types because the schema says so.
    it("sinks an entry with no game to the bottom in both directions", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", title: null }),
        entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", title: "Bloodborne" }),
        entry({ id: 3, createdAt: "2026-01-03T00:00:00Z", title: "Hades" }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.NAME, SORT_DIRECTION.ASC))).toEqual([2, 3, 1])
      expect(ids(sortEntries(list, SORT_FIELD.NAME, SORT_DIRECTION.DESC))).toEqual([3, 2, 1])
    })
  })

  describe("added", () => {
    it("puts the newest first when descending and the oldest first when ascending", () => {
      const list = [
        entry({ id: 1, createdAt: "2026-01-02T00:00:00Z" }),
        entry({ id: 2, createdAt: "2026-01-03T00:00:00Z" }),
        entry({ id: 3, createdAt: "2026-01-01T00:00:00Z" }),
      ]
      expect(ids(sortEntries(list, SORT_FIELD.ADDED, SORT_DIRECTION.DESC))).toEqual([2, 1, 3])
      expect(ids(sortEntries(list, SORT_FIELD.ADDED, SORT_DIRECTION.ASC))).toEqual([3, 1, 2])
    })
  })

  // The input is TanStack Query's cached array. Sorting it in place would
  // reorder the cache under every other consumer.
  it("does not mutate its input", () => {
    const list = [
      entry({ id: 1, createdAt: "2026-01-01T00:00:00Z", rating: 2 }),
      entry({ id: 2, createdAt: "2026-01-02T00:00:00Z", rating: 9 }),
    ]
    sortEntries(list, SORT_FIELD.RATING, SORT_DIRECTION.DESC)
    expect(ids(list)).toEqual([1, 2])
  })

  it("returns an empty array unchanged", () => {
    expect(sortEntries([], SORT_FIELD.RATING, SORT_DIRECTION.DESC)).toEqual([])
  })

  it("gives each field the direction anyone actually wants", () => {
    expect(NATURAL_DIRECTION[SORT_FIELD.RATING]).toBe(SORT_DIRECTION.DESC)
    expect(NATURAL_DIRECTION[SORT_FIELD.NAME]).toBe(SORT_DIRECTION.ASC)
    expect(NATURAL_DIRECTION[SORT_FIELD.ADDED]).toBe(SORT_DIRECTION.DESC)
  })
})
