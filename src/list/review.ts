import { textLength } from "../utils/textLength"

/**
 * Matches validate.Review's reviewMaxRunes.
 *
 * There is no CHECK constraint behind it — user_games.review is plain text — so
 * this constant and the Go one are the whole enforcement, and they have to
 * agree. Before the frontend knew the limit at all, exceeding it came back as a
 * bare 400 that rendered as "something went wrong".
 */
export const REVIEW_MAX_LENGTH = 8000

/**
 * Whether a review exceeds what the API will accept.
 *
 * Here rather than beside the field, because the submit buttons that have to
 * refuse live in two different callers — the detail card and the add flow —
 * and a component file may not export helpers without breaking fast refresh.
 */
export const reviewTooLong = (review: string): boolean => textLength(review) > REVIEW_MAX_LENGTH
