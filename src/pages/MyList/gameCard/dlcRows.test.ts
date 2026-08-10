import { describe, expect, it } from "vitest"
import { addOnsOf, canOpenAddOn, dlcRow, parentEntryOf } from "./dlcRows"
import type { IGDBGame, UserGame } from "../../../api/generated/models"

const igdbGame = (igdbId: number): IGDBGame => ({ igdbId, title: `Game ${igdbId}`, kind: "dlc" }) as unknown as IGDBGame
const entry = (igdbId: number, gameId: number, category: string): UserGame =>
  ({ id: gameId, gameId, category, game: { igdbId } }) as unknown as UserGame
const addOn = (igdbId: number, kind: string, parentIgdbId?: number): UserGame =>
  ({ id: igdbId, gameId: igdbId, category: "finished", game: { igdbId, kind, parentIgdbId } }) as unknown as UserGame

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

describe("addOnsOf", () => {
  const borderlands = addOn(314246, "main_game")
  const storyPack = addOn(396087, "dlc", 314246)
  const bountyPack = addOn(396307, "dlc", 314246)
  const unrelated = addOn(325582, "expansion", 203722)

  it("collects the add-ons belonging to one game", () => {
    const found = addOnsOf(borderlands, [borderlands, storyPack, unrelated, bountyPack])

    expect(found.map((e) => e.game?.igdbId)).toEqual([396087, 396307])
  })

  it("is empty when the game has none in this list", () => {
    expect(addOnsOf(borderlands, [borderlands, unrelated])).toEqual([])
  })

  // The same kind rule everywhere else uses. GTA V Enhanced points at GTA V,
  // but it is a release in its own right and must not be listed beneath it.
  it("ignores an expanded game that merely points at this one", () => {
    const gta = addOn(1020, "main_game")
    const enhanced = addOn(334254, "expanded_game", 1020)

    expect(addOnsOf(gta, [gta, enhanced])).toEqual([])
  })

  it("is empty for no parent at all", () => {
    expect(addOnsOf(null, [storyPack])).toEqual([])
  })
})

describe("canOpenAddOn", () => {
  it("opens something you finished", () => {
    expect(canOpenAddOn("finished")).toBe(true)
  })

  it("opens something you are playing", () => {
    expect(canOpenAddOn("currently_playing")).toBe(true)
  })

  // The card would be empty: PLAY mode shows no rating and no review, and an
  // add-on has no add-on list of its own to fill the space either.
  it("does not open a want-to-play add-on", () => {
    expect(canOpenAddOn("want_to_play")).toBe(false)
  })

  it("does not open one you do not have", () => {
    expect(canOpenAddOn(undefined)).toBe(false)
  })
})

describe("parentEntryOf", () => {
  const parent = addOn(203722, "main_game")

  it("finds the parent of an add-on you own", () => {
    expect(parentEntryOf(addOn(325582, "expansion", 203722), [parent])).toBe(parent)
  })

  it("is undefined when the parent is not in your list", () => {
    expect(parentEntryOf(addOn(325582, "expansion", 203722), [])).toBeUndefined()
  })

  // The same kind rule the list hides by. A remaster descends from the
  // original, but it is not an add-on to it, so it must never offer to take
  // you "back" to a game it merely came after.
  it("is undefined for a remaster whose original you own", () => {
    expect(parentEntryOf(addOn(19457, "remaster", 472), [addOn(472, "main_game")])).toBeUndefined()
  })

  it("is undefined for an expanded game whose base you own", () => {
    expect(parentEntryOf(addOn(334254, "expanded_game", 1020), [addOn(1020, "main_game")])).toBeUndefined()
  })

  it("is undefined for an add-on with no parent recorded", () => {
    expect(parentEntryOf(addOn(325582, "expansion"), [parent])).toBeUndefined()
  })

  it("is undefined for no entry at all", () => {
    expect(parentEntryOf(null, [parent])).toBeUndefined()
  })
})
