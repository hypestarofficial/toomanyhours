import { describe, expect, it } from "vitest"
import { gameCardMode, GAME_CARD_MODE } from "./gameCardMode"
import { LIST_TYPE } from "../../../helpers/enums"
import type { UserGameCategory } from "../../../api/generated/models"

describe("gameCardMode", () => {
  it("offers editing for a finished game", () => {
    expect(gameCardMode(LIST_TYPE.FINISHED)).toBe(GAME_CARD_MODE.EDIT)
  })

  it("offers finishing for a game in progress", () => {
    expect(gameCardMode(LIST_TYPE.CURRENTLY_PLAYING)).toBe(GAME_CARD_MODE.FINISH)
  })

  it("offers playing for a game on the shelf", () => {
    expect(gameCardMode(LIST_TYPE.WANT_TO_PLAY)).toBe(GAME_CARD_MODE.PLAY)
  })

  // The modal renders with entry === null between openings, and a category the
  // frontend does not know about would otherwise fall through to whichever
  // branch happened to be last. Play is the mode with no rating form, so an
  // unknown category cannot produce a screen that writes a rating the API will
  // reject.
  it("falls back to play for a missing or unknown category", () => {
    expect(gameCardMode(undefined)).toBe(GAME_CARD_MODE.PLAY)
    expect(gameCardMode("abandoned" as UserGameCategory)).toBe(GAME_CARD_MODE.PLAY)
  })
})
