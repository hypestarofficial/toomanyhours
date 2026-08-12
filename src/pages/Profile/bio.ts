/** Matches validate.Bio's bioMaxRunes and the users_bio_length CHECK. */
export const BIO_MAX_LENGTH = 500

/**
 * How long a bio is, counted the way the server counts it.
 *
 * `String.prototype.length` counts UTF-16 code units, so `"🎮".length` is 2 —
 * while Go's `utf8.RuneCountInString` and Postgres's `char_length` both see one
 * character. A counter built on `.length` would refuse to save a bio the API
 * would have accepted, and disagree with the CHECK constraint.
 *
 * Spreading a string iterates code points, which is exactly what a rune is.
 *
 * Pure and tested rather than inline in the component, because no component
 * renders in any test in this project — a rule that can be wrong has to live
 * outside a component or nothing checks it. This one is invisible until
 * somebody writes a bio full of emoji.
 */
export const bioLength = (value: string): number => [...value].length
