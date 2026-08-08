import { describe, expect, it } from "vitest"
import { changelog } from "./changelog"

// Semantic, not lexicographic. "0.10.0" < "0.9.0" as strings, which is the
// wrong answer and will not be wrong until the tenth minor release — long
// after anyone remembers this file sorts itself by hand.
const compareVersions = (a: string, b: string): number => {
  const left = a.split(".").map(Number)
  const right = b.split(".").map(Number)

  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] - right[i]
  }
  return 0
}

describe("changelog", () => {
  it("has entries", () => {
    expect(changelog.length).toBeGreaterThan(0)
  })

  it("has no duplicate versions", () => {
    const versions = changelog.map((entry) => entry.version)
    expect(new Set(versions).size).toBe(versions.length)
  })

  // The mistake this file invites: pasting a new entry at the bottom.
  it("is ordered newest first", () => {
    for (let i = 1; i < changelog.length; i++) {
      expect(compareVersions(changelog[i - 1].version, changelog[i].version)).toBeGreaterThan(0)
    }
  })

  it("uses well-formed versions and dates", () => {
    for (const entry of changelog) {
      expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/)
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(entry.date))).toBe(false)

      // Not "not in the future": a date-only string parses as UTC midnight, so
      // west of UTC an entry dated today is legitimately ahead of Date.now()
      // and a strict check would fail depending on where it runs. A day of
      // slack still catches the mistake worth catching — a typo'd year.
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000
      expect(Date.parse(entry.date)).toBeLessThan(tomorrow)
    }
  })

  it("gives every version something to say", () => {
    for (const entry of changelog) {
      expect(entry.changes.length).toBeGreaterThan(0)
      for (const change of entry.changes) {
        expect(change.trim()).not.toBe("")
      }
    }
  })
})
