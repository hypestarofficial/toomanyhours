import type { AddUserGameRequest, UpdateUserGameRequest } from "../../../api/generated/models"
import type { RatingFormValues } from "../RatingFields"
import { LIST_TYPE } from "../../../helpers/enums"

/**
 * The body for POST /me/games.
 *
 * Pure, and separate from the modal, because the omission rules below are the
 * only real logic in submitting — and getting one wrong fails at the API with
 * a 400 rather than anywhere a component test would look.
 *
 * Two rules, both load-bearing:
 *
 * - **0 is omitted, never sent.** The form uses 0 for unrated, and on PATCH
 *   that is the API's "clear my rating" sentinel. POST rejects it: there is
 *   nothing to clear on a row that does not exist yet. Sending it would 400
 *   the most ordinary add there is — a finished game with no score.
 * - **Neither field survives a non-finished category.** The form keeps its
 *   values when the category changes, so a rating typed against `finished`
 *   is still in state after switching to `want_to_play`. The API rejects a
 *   rating on any other category, so it must not be sent.
 */
export const addGamePayload = (igdbId: number, category: LIST_TYPE, fields: RatingFormValues): AddUserGameRequest => {
  const scored = category === LIST_TYPE.FINISHED

  return {
    igdbId,
    category,
    ...(scored && fields.rating > 0 ? { rating: fields.rating } : {}),
    ...(scored && fields.review.trim() ? { review: fields.review.trim() } : {}),
  }
}

/**
 * The body for PATCH /me/games/{gameId} when editing an entry you already have.
 *
 * The mirror image of addGamePayload, and deliberately not the same rules:
 *
 * - **0 and "" are sent here, not omitted.** They are the API's clear
 *   sentinels, and they are the only way to take back a rating or a review.
 *   Omitting them, as the add path must, would make a score impossible to
 *   remove once given.
 * - **Neither field survives a non-finished category**, exactly as on the add
 *   path. The API judges the *resulting* category, so moving a finished game
 *   to want-to-play in the same request means the rating is rejected with it.
 *   The stored rating stays on the row regardless — category is a column, so a
 *   move keeps it — this only governs what the request may carry.
 */
export const editEntryPayload = (category: LIST_TYPE, fields: RatingFormValues): UpdateUserGameRequest => {
  const scored = category === LIST_TYPE.FINISHED

  return {
    category,
    ...(scored ? { rating: fields.rating, review: fields.review.trim() } : {}),
  }
}
