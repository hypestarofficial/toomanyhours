import { describe, expect, it } from "vitest"
import { dlcRow } from "./dlcRows"
import type { IGDBGame, UserGame } from "../../../api/generated/models"

const igdbGame = (igdbId: number): IGDBGame => ({ igdbId, title: `Game ${igdbId}`, kind: "dlc" }) as unknown as IGDBGame
const entry = (igdbId: number, gameId: number, category: string): UserGame =>
  ({ id: gameId, gameId, category, game: { igdbId } }) as unknown as UserGame

describe("dlcRow", () => {
  it("reports an add-on that is not in your list", () => {
    expect(dlcRow(igdbGame(396087), [])).toEqual({ igdbId: 396087, entry: undefined, category: undefined })
  })

  // The row has to show which category it is already in, so the right button
  // renders as active rather than all three looking unpicked.
  it("finds the entry and its category when you own it", () => {
    const owned = entry(396087, 55, "finished")

    expect(dlcRow(igdbGame(396087), [owned])).toEqual({ igdbId: 396087, entry: owned, category: "finished" })
  })

  it("matches on igdbId, not on the surrogate game id", () => {
    // 55 is a catalog id and 396087 an IGDB id; both are integers in
    // overlapping ranges, so a mix-up would half-work rather than fail.
    const wrong = entry(55, 396087, "finished")

    expect(dlcRow(igdbGame(396087), [wrong]).entry).toBeUndefined()
  })

  it("tolerates an entry with no game", () => {
    const broken = { id: 9, gameId: 9, category: "finished" } as unknown as UserGame

    expect(dlcRow(igdbGame(396087), [broken]).entry).toBeUndefined()
  })
})
