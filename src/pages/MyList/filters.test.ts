import { describe, expect, it } from "vitest"
import { matchesFilters } from "./filters"
import type { UserGame } from "../../api/generated/models"

const entry = (title: string, genreIDs: number[]): UserGame =>
  ({
    id: 1,
    gameId: 100,
    category: "finished",
    rating: null,
    review: null,
    createdAt: "",
    updatedAt: "",
    game: { id: 100, title, genres: genreIDs.map((id) => ({ id, genre: `Genre ${id}` })) },
  }) as UserGame

describe("matchesFilters", () => {
  it("passes everything when no filters are set", () => {
    expect(matchesFilters(entry("Doom", [1]), "", [])).toBe(true)
  })

  it("matches a title substring", () => {
    expect(matchesFilters(entry("The Witcher 3", [1]), "witcher", [])).toBe(true)
  })

  it("is case insensitive in both directions", () => {
    expect(matchesFilters(entry("DOOM Eternal", [1]), "doom", [])).toBe(true)
    expect(matchesFilters(entry("doom eternal", [1]), "DOOM", [])).toBe(true)
  })

  it("rejects a title that does not contain the query", () => {
    expect(matchesFilters(entry("Hades", [1]), "witcher", [])).toBe(false)
  })

  it("ignores surrounding whitespace in the query", () => {
    expect(matchesFilters(entry("Hades", [1]), "  hades  ", [])).toBe(true)
  })

  it("matches if the game has any of the selected genres", () => {
    expect(matchesFilters(entry("Doom", [1, 5]), "", [5, 9])).toBe(true)
  })

  it("rejects when the game has none of the selected genres", () => {
    expect(matchesFilters(entry("Doom", [1, 5]), "", [7, 9])).toBe(false)
  })

  it("combines search and genres with AND", () => {
    const e = entry("Doom Eternal", [3])
    expect(matchesFilters(e, "doom", [3])).toBe(true)
    expect(matchesFilters(e, "doom", [4])).toBe(false)
    expect(matchesFilters(e, "hades", [3])).toBe(false)
  })

  // The API omits `genres` when a game has none, and the generated types mark
  // both `game` and `genres` optional. A real row can therefore arrive without
  // them — and tidy fixtures would never catch it.
  it("does not match a genre filter when the game has no genres", () => {
    const noGenres = { ...entry("Doom", []), game: { id: 100, title: "Doom" } } as UserGame
    expect(matchesFilters(noGenres, "", [1])).toBe(false)
    expect(matchesFilters(noGenres, "doom", [])).toBe(true)
  })

  it("does not throw when the game is missing entirely", () => {
    const noGame = { ...entry("Doom", []), game: undefined } as UserGame
    expect(matchesFilters(noGame, "doom", [])).toBe(false)
    expect(matchesFilters(noGame, "", [1])).toBe(false)
    expect(matchesFilters(noGame, "", [])).toBe(true)
  })
})
