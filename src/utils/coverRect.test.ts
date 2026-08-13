import { describe, expect, it } from "vitest"
import { coverRect } from "./coverRect"

describe("coverRect", () => {
  it("uses the whole of a square source", () => {
    expect(coverRect(500, 500)).toEqual({ sx: 0, sy: 0, size: 500 })
  })

  // The failure this exists to prevent: scaling the full rectangle into a
  // square squashes every photo that is not already one.
  it("takes a centred square from a wide source", () => {
    expect(coverRect(800, 200)).toEqual({ sx: 300, sy: 0, size: 200 })
  })

  it("takes a centred square from a tall source", () => {
    expect(coverRect(200, 800)).toEqual({ sx: 0, sy: 300, size: 200 })
  })

  it("centres on whole pixels when the difference is odd", () => {
    const { sx, sy, size } = coverRect(101, 50)

    expect(size).toBe(50)
    expect(Number.isInteger(sx)).toBe(true)
    expect(sy).toBe(0)
    // 101 - 50 = 51, so a centred crop starts at 25 or 26, not 25.5.
    expect(sx).toBe(25)
  })

  it("handles a source smaller than the target", () => {
    expect(coverRect(40, 90)).toEqual({ sx: 0, sy: 25, size: 40 })
  })
})
