import { describe, expect, it } from "vitest"
import { ownedIgdbIds, rowState, ROW_STATE } from "./rows"
import type { UserGame } from "../../../api/generated/models"

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

describe("rowState", () => {
  const owned = new Set([1942])

  it("is selectable when nothing applies", () => {
    expect(rowState(9630, owned, null)).toBe(ROW_STATE.SELECTABLE)
  })

  it("is owned when already in the list", () => {
    expect(rowState(1942, owned, null)).toBe(ROW_STATE.OWNED)
  })

  it("is selected when picked", () => {
    expect(rowState(9630, owned, 9630)).toBe(ROW_STATE.SELECTED)
  })

  // Selecting is single, so another row being chosen leaves this one
  // selectable rather than blocking it — picking it simply replaces the choice.
  it("stays selectable while a different row is chosen", () => {
    expect(rowState(9630, owned, 1020)).toBe(ROW_STATE.SELECTABLE)
  })

  // Owned wins over everything. Without this precedence a game you already
  // have could be selected, and the add would fail with a 409.
  it("reports owned even when the id is somehow also selected", () => {
    expect(rowState(1942, owned, 1942)).toBe(ROW_STATE.OWNED)
  })
})
