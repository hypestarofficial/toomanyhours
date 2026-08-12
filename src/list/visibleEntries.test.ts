import { describe, expect, it } from "vitest"
import { visibleEntries } from "./visibleEntries"
import type { UserGame } from "../api/generated/models"

// Only the fields the function reads. The generated UserGame is far wider and
// filling it in would bury what each case is actually about.
const entry = (igdbId: number, kind: string, parentIgdbId?: number): UserGame =>
  ({ id: igdbId, gameId: igdbId, category: "finished", game: { igdbId, kind, parentIgdbId } }) as unknown as UserGame

const shown = (entries: UserGame[]) => visibleEntries(entries).map((e) => e.game?.igdbId)

describe("visibleEntries", () => {
  it("hides a DLC when its parent is in the list", () => {
    const list = [entry(314246, "main_game"), entry(396087, "dlc", 314246)]

    expect(shown(list)).toEqual([314246])
  })

  it("hides an expansion when its parent is in the list", () => {
    const list = [entry(103292, "main_game"), entry(140517, "expansion", 103292)]

    expect(shown(list)).toEqual([103292])
  })

  // Nothing may silently disappear. Without the parent there is no card to
  // reach the add-on from, so it has to stay a top-level entry.
  it("shows an expansion whose parent is not in the list", () => {
    expect(shown([entry(140517, "expansion", 103292)])).toEqual([140517])
  })

  // The case that makes this rule turn on kind rather than on having a parent.
  // GTA V Enhanced is the release someone played, not an addition to one, and
  // IGDB still gives it GTA V as a parent.
  it("shows an expanded game even when its parent is in the list", () => {
    const list = [entry(1020, "main_game"), entry(334254, "expanded_game", 1020)]

    expect(shown(list)).toEqual([1020, 334254])
  })

  it("shows a remaster even when its parent is in the list", () => {
    const list = [entry(472, "main_game"), entry(19457, "remaster", 472)]

    expect(shown(list)).toEqual([472, 19457])
  })

  it("shows a bundle even when its parent is in the list", () => {
    const list = [entry(9630, "main_game"), entry(21892, "bundle", 9630)]

    expect(shown(list)).toEqual([9630, 21892])
  })

  it("shows a game with no parent", () => {
    expect(shown([entry(1942, "main_game")])).toEqual([1942])
  })

  // `game` is optional in the generated types, so a real entry can arrive
  // without one. It must not throw, and it must not vanish either.
  it("keeps an entry with no game rather than throwing", () => {
    const broken = { id: 9, gameId: 9, category: "finished" } as unknown as UserGame

    expect(visibleEntries([broken])).toHaveLength(1)
  })
})
