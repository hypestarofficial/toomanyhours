import { describe, expect, it } from "vitest"
import { textLength } from "./textLength"

describe("textLength", () => {
  it("counts plain characters", () => {
    expect(textLength("hello")).toBe(5)
  })

  it("counts an empty string as nothing", () => {
    expect(textLength("")).toBe(0)
  })

  // The whole reason this exists. JavaScript's .length counts UTF-16 code
  // units, so an emoji outside the BMP counts as 2 — while Go's
  // utf8.RuneCountInString and Postgres's char_length both count 1. A counter
  // built on .length would block a save the server would have accepted.
  it("counts an emoji as one, where .length says two", () => {
    expect("🎮".length).toBe(2)
    expect(textLength("🎮")).toBe(1)
  })

  it("counts a multi-byte script one per character", () => {
    expect(textLength("日本語")).toBe(3)
  })

  it("agrees with .length when every character is ASCII", () => {
    const ascii = "a".repeat(500)
    expect(textLength(ascii)).toBe(ascii.length)
  })
})
