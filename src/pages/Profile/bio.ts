import { textLength } from "../../utils/textLength"

/** Matches validate.Bio's bioMaxRunes and the users_bio_length CHECK. */
export const BIO_MAX_LENGTH = 500

/**
 * How long a bio is, counted the way the server counts it.
 *
 * Delegates to textLength: the review field needs the identical rule, and two
 * copies of "count code points, not UTF-16 units" is two places for it to be
 * got wrong. The constant stays here because the *limit* is a bio fact.
 */
export const bioLength = (value: string): number => textLength(value)
