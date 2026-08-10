import { describe, expect, it } from "vitest"
import { addOnSummary, ADD_ON_TOOLTIP_MAX } from "./addOnSummary"

const titles = (n: number) => Array.from({ length: n }, (_, i) => `Add-on ${i + 1}`)

describe("addOnSummary", () => {
  it("names everything when it fits", () => {
    expect(addOnSummary(titles(3))).toEqual({ titles: ["Add-on 1", "Add-on 2", "Add-on 3"], remaining: 0 })
  })

  // The boundary, which is the only thing here worth getting wrong. Exactly at
  // the cap must still name everything: an "+0 more" line would be absurd.
  it("names all of them at exactly the cap", () => {
    const summary = addOnSummary(titles(ADD_ON_TOOLTIP_MAX))

    expect(summary.titles).toHaveLength(ADD_ON_TOOLTIP_MAX)
    expect(summary.remaining).toBe(0)
  })

  it("counts the overflow one past the cap", () => {
    const summary = addOnSummary(titles(ADD_ON_TOOLTIP_MAX + 1))

    expect(summary.titles).toHaveLength(ADD_ON_TOOLTIP_MAX)
    expect(summary.remaining).toBe(1)
  })

  it("counts a large overflow", () => {
    expect(addOnSummary(titles(30)).remaining).toBe(20)
  })

  it("handles none at all", () => {
    expect(addOnSummary([])).toEqual({ titles: [], remaining: 0 })
  })
})
