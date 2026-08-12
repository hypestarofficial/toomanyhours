/**
 * How long a piece of text is, counted the way the server counts it.
 *
 * `String.prototype.length` counts UTF-16 code units, so `"🎮".length` is 2 —
 * while Go's `utf8.RuneCountInString` and Postgres's `char_length` both see one
 * character. A counter built on `.length` would refuse to save text the API
 * would have accepted, and disagree with any CHECK constraint.
 *
 * Spreading a string iterates code points, which is exactly what a rune is.
 *
 * Shared by every length-capped field — the bio and the review — because there
 * is one right way to count and no reason for two copies of it to drift.
 */
export const textLength = (value: string): number => [...value].length
