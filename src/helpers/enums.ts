// Values match the database CHECK constraint and the API exactly. A
// camelCase-to-snake_case mapping layer would have to exist in both
// directions, and would be one more place for the two to drift.
export const LIST_TYPE = {
  FINISHED: "finished",
  CURRENTLY_PLAYING: "currently_playing",
  WANT_TO_PLAY: "want_to_play",
} as const

export type LIST_TYPE = (typeof LIST_TYPE)[keyof typeof LIST_TYPE]
