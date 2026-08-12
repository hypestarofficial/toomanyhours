import { describe, expect, it } from "vitest"
import { rowState, ROW_STATE } from "./rows"
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
