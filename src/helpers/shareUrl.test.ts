import { describe, expect, it } from "vitest"
import { profileShareUrl } from "./shareUrl"

describe("profileShareUrl", () => {
  it("builds an absolute link to the public profile", () => {
    expect(profileShareUrl("https://toomanyhours.app", "hype")).toBe("https://toomanyhours.app/u/hype")
  })

  it("keeps the port, so a LAN or dev link is shareable as-is", () => {
    expect(profileShareUrl("http://192.168.1.20:3100", "hype")).toBe("http://192.168.1.20:3100/u/hype")
  })

  it("does not double the slash when the origin has a trailing one", () => {
    expect(profileShareUrl("https://toomanyhours.app/", "hype")).toBe("https://toomanyhours.app/u/hype")
  })

  it("canonicalises the username", () => {
    expect(profileShareUrl("https://toomanyhours.app", "  HypE  ")).toBe("https://toomanyhours.app/u/hype")
  })

  // The caller renders this into a readonly field and a copy button; an empty
  // string is what tells it there is nothing to share yet.
  it("returns an empty string when there is no username", () => {
    expect(profileShareUrl("https://toomanyhours.app", "")).toBe("")
    expect(profileShareUrl("https://toomanyhours.app", "   ")).toBe("")
  })
})
