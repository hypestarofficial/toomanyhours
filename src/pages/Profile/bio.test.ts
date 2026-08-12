import { describe, expect, it } from "vitest"
import { BIO_MAX_LENGTH, bioLength } from "./bio"

describe("bioLength", () => {
  it("counts plain characters", () => {
    expect(bioLength("hello")).toBe(5)
  })

  it("counts an empty string as nothing", () => {
    expect(bioLength("")).toBe(0)
  })

  // The whole reason this function exists. JavaScript's .length counts UTF-16
  // code units, so an emoji outside the BMP counts as 2 — while Go's
  // utf8.RuneCountInString and Postgres's char_length both count 1. A counter
  // built on .length would block a save the server would have accepted.
  it("counts an emoji as one, where .length says two", () => {
    expect("🎮".length).toBe(2)
    expect(bioLength("🎮")).toBe(1)
  })

  it("counts a multi-byte script one per character", () => {
    expect(bioLength("日本語")).toBe(3)
  })

  it("agrees with .length when every character is ASCII", () => {
    const ascii = "a".repeat(500)
    expect(bioLength(ascii)).toBe(ascii.length)
  })

  // 500 emoji are 1000 UTF-16 units, so a .length counter would refuse this
  // bio while the API accepts it.
  it("counts 500 emoji as 500, not 1000", () => {
    expect(bioLength("🎮".repeat(500))).toBe(BIO_MAX_LENGTH)
  })

  it("caps at 500", () => {
    expect(BIO_MAX_LENGTH).toBe(500)
  })
})
