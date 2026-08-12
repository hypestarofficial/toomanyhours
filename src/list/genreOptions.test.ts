import { describe, expect, it } from "vitest"
import { genreOptions } from "./genreOptions"
import type { UserGame } from "../api/generated/models"

const entry = (id: number, genres?: { id: number; name: string }[] | null): UserGame =>
  ({
    id,
    gameId: id,
    category: "finished",
    createdAt: "",
    updatedAt: "",
    game: genres === null ? undefined : { id, title: `Game ${id}`, genres },
  }) as unknown as UserGame

describe("genreOptions", () => {
  it("collects the genres across entries", () => {
    const list = [entry(1, [{ id: 5, name: "Shooter" }]), entry(2, [{ id: 9, name: "Adventure" }])]
    expect(genreOptions(list)).toEqual([
      { label: "Adventure", value: 9 },
      { label: "Shooter", value: 5 },
    ])
  })

  it("lists a genre once when several games share it", () => {
    const list = [entry(1, [{ id: 5, name: "Shooter" }]), entry(2, [{ id: 5, name: "Shooter" }]), entry(3, [{ id: 5, name: "Shooter" }])]
    expect(genreOptions(list)).toEqual([{ label: "Shooter", value: 5 }])
  })

  // Sorted by name, not by the order games happen to appear in. A filter list
  // in arrival order is unsearchable by eye.
  it("sorts by name rather than by first appearance", () => {
    const list = [entry(1, [{ id: 5, name: "Shooter" }]), entry(2, [{ id: 9, name: "Adventure" }]), entry(3, [{ id: 2, name: "Puzzle" }])]
    expect(genreOptions(list).map((o) => o.label)).toEqual(["Adventure", "Puzzle", "Shooter"])
  })

  it("returns nothing for an empty list", () => {
    expect(genreOptions([])).toEqual([])
  })

  // The API omits `genres` for a game with none, and `game` is optional in the
  // generated types. Both are real shapes, not defensive padding.
  it("does not throw on a game with no genres or an entry with no game", () => {
    const list = [entry(1, undefined), entry(2, null), entry(3, [{ id: 5, name: "Shooter" }])]
    expect(genreOptions(list)).toEqual([{ label: "Shooter", value: 5 }])
  })

  it("collects several genres from one game", () => {
    const list = [
      entry(1, [
        { id: 5, name: "Shooter" },
        { id: 9, name: "Adventure" },
      ]),
    ]
    expect(genreOptions(list)).toEqual([
      { label: "Adventure", value: 9 },
      { label: "Shooter", value: 5 },
    ])
  })
})
