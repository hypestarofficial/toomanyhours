import { describe, expect, it } from "vitest"
import { changedFields, hasChanges, saveBlockedReason } from "./settingsForm"
import type { SavedSettings, SettingsForm } from "./settingsForm"

const saved: SavedSettings = { username: "hype", bio: "plays too much", visibility: "public" }
const pristine: SettingsForm = { username: "hype", bio: "plays too much", visibility: "public" }

const form = (overrides: Partial<SettingsForm> = {}): SettingsForm => ({ ...pristine, ...overrides })

describe("changedFields", () => {
  it("sends nothing when nothing was touched", () => {
    expect(changedFields(pristine, saved)).toEqual({})
    expect(hasChanges(pristine, saved)).toBe(false)
  })

  it("sends only the field that changed", () => {
    expect(changedFields(form({ visibility: "private" }), saved)).toEqual({ visibility: "private" })
  })

  it("lowercases and trims a game tag", () => {
    expect(changedFields(form({ username: "  HYPE2  " }), saved)).toEqual({ username: "hype2" })
  })

  // The whole reason this is a tested function: a stored null and a typed ""
  // are the same state, and calling them different marks a pristine form dirty
  // — leaving Save enabled on a page nobody has touched.
  it("treats an empty box and a stored null as the same", () => {
    const withoutBio: SavedSettings = { ...saved, bio: null }
    expect(changedFields(form({ bio: "" }), withoutBio)).toEqual({})
  })

  it("sends an empty string to clear a bio that exists", () => {
    expect(changedFields(form({ bio: "   " }), saved)).toEqual({ bio: "" })
  })

  it("sends every field when all three changed", () => {
    expect(changedFields({ username: "other", bio: "new", visibility: "private" }, saved)).toEqual({
      username: "other",
      bio: "new",
      visibility: "private",
    })
  })
})

describe("saveBlockedReason", () => {
  it("allows a pristine form", () => {
    expect(saveBlockedReason(pristine, saved)).toBeNull()
  })

  it("blocks a game tag that is too short", () => {
    expect(saveBlockedReason(form({ username: "hy" }), saved)).toMatch(/at least 3/)
  })

  it("blocks a game tag with characters the server refuses", () => {
    expect(saveBlockedReason(form({ username: "hype!" }), saved)).toMatch(/lowercase letters/)
  })

  it("blocks a bio over the limit", () => {
    expect(saveBlockedReason(form({ bio: "x".repeat(501) }), saved)).toMatch(/over 500/)
  })

  // Counted the server's way. An emoji is two UTF-16 units and one character,
  // so a .length-based rule would refuse 251 emoji the API accepts happily.
  it("counts a bio in characters, not UTF-16 units", () => {
    expect(saveBlockedReason(form({ bio: "🎮".repeat(500) }), saved)).toBeNull()
  })

  // Advisory, and deliberately not enforced here: two people can claim a name
  // between the check and the submit, so the API's 409 is the authority.
  it("says nothing about a name being taken", () => {
    expect(saveBlockedReason(form({ username: "admin" }), saved)).toBeNull()
  })

  // A rule that fired on the *stored* value rather than the change would trap
  // anyone whose bio predates a lowered limit: they could never save anything
  // on this page again, including shortening the bio.
  it("ignores an untouched field that would fail today", () => {
    const longBio: SavedSettings = { ...saved, bio: "x".repeat(600) }
    expect(saveBlockedReason({ username: "hype", bio: "x".repeat(600), visibility: "private" }, longBio)).toBeNull()
  })
})
