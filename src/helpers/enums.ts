// Values match the database CHECK constraint and the API exactly. A
// camelCase-to-snake_case mapping layer would have to exist in both
// directions, and would be one more place for the two to drift.
export const LIST_TYPE = {
  FINISHED: "finished",
  CURRENTLY_PLAYING: "currently_playing",
  WANT_TO_PLAY: "want_to_play",
} as const

export type LIST_TYPE = (typeof LIST_TYPE)[keyof typeof LIST_TYPE]

// Human labels for the wire values, used by the add-game dropdown and the
// toast confirming a move. The section headings are deliberately not these:
// they render lowercase by design.
export const LIST_TYPE_LABEL: Record<LIST_TYPE, string> = {
  [LIST_TYPE.FINISHED]: "Finished",
  [LIST_TYPE.CURRENTLY_PLAYING]: "Currently playing",
  [LIST_TYPE.WANT_TO_PLAY]: "Want to play",
}
