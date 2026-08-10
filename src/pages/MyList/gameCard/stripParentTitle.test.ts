import { describe, expect, it } from "vitest"
import { stripParentTitle } from "./dlcRows"

describe("stripParentTitle", () => {
  it("drops a colon-joined parent name", () => {
    expect(stripParentTitle("Payday 2: The Diamond Store Heist", "Payday 2")).toBe("The Diamond Store Heist")
  })

  it("drops a dash-joined parent name", () => {
    expect(stripParentTitle("The Witcher 3: Wild Hunt - Blood and Wine", "The Witcher 3: Wild Hunt")).toBe("Blood and Wine")
  })

  // The reason this matches the parent title rather than splitting on
  // punctuation. Three colons; splitting on the first would leave
  // "Wild Hunt - New Quest...", which is worse than doing nothing.
  it("keeps colons that belong to the add-on's own name", () => {
    expect(stripParentTitle("The Witcher 3: Wild Hunt - New Quest: Scavenger Hunt: Wolf School Gear", "The Witcher 3: Wild Hunt")).toBe(
      "New Quest: Scavenger Hunt: Wolf School Gear",
    )
  })

  it("leaves an add-on that is not named after its parent", () => {
    expect(stripParentTitle("Hearts of Stone", "The Witcher 3: Wild Hunt")).toBe("Hearts of Stone")
  })

  // Stripping would leave nothing, so the full title is better than a blank row.
  it("keeps a title identical to its parent", () => {
    expect(stripParentTitle("Dave the Diver", "Dave the Diver")).toBe("Dave the Diver")
  })

  it("keeps the title when there is no parent to strip", () => {
    expect(stripParentTitle("Payday 2: The Diamond Store Heist", undefined)).toBe("Payday 2: The Diamond Store Heist")
  })

  it("matches case-insensitively", () => {
    expect(stripParentTitle("PAYDAY 2: The Alesso Heist", "Payday 2")).toBe("The Alesso Heist")
  })

  it("handles an em dash", () => {
    expect(stripParentTitle("Gears 5 — Hivebusters", "Gears 5")).toBe("Hivebusters")
  })
})
