import { describe, expect, it } from "vitest"
import { changelog } from "./changelog"
// The manifest itself, so the check cannot drift from what ships.
import pkg from "../package.json"

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

  // An empty string is not the way to say "no intro" — undefined is. A blank
  // one renders as a paragraph of nothing above the list, pushing it down for
  // no reason, and no other check here would notice.
  it("has no blank intro", () => {
    for (const entry of changelog) {
      if (entry.intro !== undefined) {
        expect(entry.intro.trim()).not.toBe("")
      }
    }
  })
})

// The rule this encodes is the one already written down: a feature release has
// something a person would notice, so it needs an entry, while a patch may have
// nothing worth telling anyone and is allowed to skip.
//
// Batched releases do not weaken it. Work now sits on main unreleased, which
// this cannot see and has no reason to — package.json is not moving, so there
// is nothing to be missing an entry for. It fires exactly when a release is
// declared, which is the moment the entry is owed.
//
// It exists because 1.6.0 shipped with its entry silently missing — the version
// was bumped, the entry was not written, and every other test here passed,
// because "versions may skip" makes a gap indistinguishable from a deliberate
// omission unless you look at *how big* the gap is.
describe("changelog against package.json", () => {
  const appVersion = pkg.version

  it("is never ahead of the app", () => {
    expect(compareVersions(changelog[0].version, appVersion)).toBeLessThanOrEqual(0)
  })

  it("has an entry for the current feature release", () => {
    const [appMajor, appMinor] = appVersion.split(".").map(Number)
    const [newestMajor, newestMinor] = changelog[0].version.split(".").map(Number)

    // Only the major and minor are compared: a patch above the newest entry is
    // the allowed case, and a major or minor above it is a feature nobody was
    // told about.
    expect(
      { major: newestMajor, minor: newestMinor },
      `package.json is ${appVersion} but the newest changelog entry is ${changelog[0].version} — a feature release needs an entry`,
    ).toEqual({ major: appMajor, minor: appMinor })
  })
})
