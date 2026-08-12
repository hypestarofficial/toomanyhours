import { describe, expect, it } from "vitest"
import { ownedIgdbIds } from "./ownedIgdbIds"
import type { UserGame } from "../api/generated/models"

const entry = (igdbId: number): UserGame => ({ id: 1, gameId: 1, category: "finished", game: { igdbId } }) as unknown as UserGame

describe("ownedIgdbIds", () => {
  it("collects the IGDB id of every entry", () => {
    const owned = ownedIgdbIds([entry(1942), entry(9630)])
    expect([...owned].sort()).toEqual([1942, 9630])
  })

  it("is empty when the list has not loaded", () => {
    expect(ownedIgdbIds(undefined).size).toBe(0)
  })

  // `game` is optional in the generated types, so a real entry can arrive
  // without one. Reaching through it unguarded would throw on a live list.
  it("skips an entry with no game rather than throwing", () => {
    const broken = { id: 2, gameId: 2, category: "finished" } as unknown as UserGame
    expect(ownedIgdbIds([entry(1942), broken]).size).toBe(1)
  })
})
