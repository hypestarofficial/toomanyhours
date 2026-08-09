import { describe, expect, it } from "vitest"
import { addGamePayload } from "./payload"
import { LIST_TYPE } from "../../../helpers/enums"

const blank = { rating: 0, review: "" }

describe("addGamePayload", () => {
  it("carries a rating and a review on a finished game", () => {
    expect(addGamePayload(1942, LIST_TYPE.FINISHED, { rating: 8.5, review: "Great" })).toEqual({
      igdbId: 1942,
      category: "finished",
      rating: 8.5,
      review: "Great",
    })
  })

  // The one that would 400. 0 means unrated in the form and "clear my rating"
  // on PATCH, but POST rejects it — there is nothing to clear on a row that
  // does not exist yet. Absence, not a zero.
  it("omits an unrated 0 rather than sending it", () => {
    const payload = addGamePayload(1942, LIST_TYPE.FINISHED, blank)

    expect("rating" in payload).toBe(false)
    expect(payload).toEqual({ igdbId: 1942, category: "finished" })
  })

  it("omits a blank review rather than sending an empty string", () => {
    const payload = addGamePayload(1942, LIST_TYPE.FINISHED, { rating: 7, review: "   " })

    expect("review" in payload).toBe(false)
    expect(payload.rating).toBe(7)
  })

  it("trims a review it does send", () => {
    expect(addGamePayload(1942, LIST_TYPE.FINISHED, { rating: 0, review: "  Great  " }).review).toBe("Great")
  })

  // The form keeps its values when the category changes, so a rating typed
  // against finished is still in state after switching. The API rejects a
  // rating on any other category, so neither field may ride along.
  it.each([LIST_TYPE.WANT_TO_PLAY, LIST_TYPE.CURRENTLY_PLAYING])("sends neither field for %s", (category) => {
    const payload = addGamePayload(1942, category, { rating: 8.5, review: "Great" })

    expect(payload).toEqual({ igdbId: 1942, category })
  })
})
