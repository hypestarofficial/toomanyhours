import { describe, expect, it } from "vitest"
import { MAX_AVATAR_FILE_BYTES, avatarFileError } from "./avatarFile"

const file = (type: string, size = 1024) => ({ type, size })

describe("avatarFileError", () => {
  it("accepts every format the server can decode", () => {
    expect(avatarFileError(file("image/jpeg"))).toBeNull()
    expect(avatarFileError(file("image/png"))).toBeNull()
    expect(avatarFileError(file("image/gif"))).toBeNull()
  })

  // The browser would happily re-encode a WebP to JPEG, which is exactly why
  // this is easy to get wrong: it works here and 400s from anywhere else.
  it("refuses a format the API cannot decode", () => {
    expect(avatarFileError(file("image/webp"))).toMatch(/JPEG, PNG or GIF/)
  })

  // Some browsers report an empty type for a file they cannot identify — a .txt
  // renamed to .jpg among them.
  it("refuses a file with no type at all", () => {
    expect(avatarFileError(file(""))).toMatch(/JPEG, PNG or GIF/)
  })

  it("accepts a file exactly at the size cap", () => {
    expect(avatarFileError(file("image/jpeg", MAX_AVATAR_FILE_BYTES))).toBeNull()
  })

  it("refuses a file over the size cap, and says so", () => {
    const error = avatarFileError(file("image/jpeg", MAX_AVATAR_FILE_BYTES + 1))

    expect(error).toMatch(/10 MB/)
    // The format message would be wrong here: this file is a JPEG.
    expect(error).not.toMatch(/JPEG, PNG or GIF/)
  })
})
