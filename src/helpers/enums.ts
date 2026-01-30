export const LIST_TYPE = {
  FINISHED: "finished",
  CURRENTLY_PLAYING: "currentlyPlaying",
  WANT_TO_PLAY: "wantToPlay",
} as const

export type LIST_TYPE = (typeof LIST_TYPE)[keyof typeof LIST_TYPE]
