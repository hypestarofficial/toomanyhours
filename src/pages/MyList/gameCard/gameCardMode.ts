import { LIST_TYPE } from "../../../helpers/enums"
import type { UserGameCategory } from "../../../api/generated/models"

/**
 * What the detail modal offers to do. Named for the action rather than the
 * category so the component reads as three screens rather than a switch over
 * data it happens to have.
 */
export const GAME_CARD_MODE = {
  PLAY: "play",
  FINISH: "finish",
  EDIT: "edit",
} as const

export type GAME_CARD_MODE = (typeof GAME_CARD_MODE)[keyof typeof GAME_CARD_MODE]

/**
 * Pure, so the one branching decision in the modal is testable without a DOM —
 * this project has no testing-library and this change does not add one.
 *
 * Unknown and missing categories fall back to PLAY deliberately: it is the only
 * mode with no rating form, so a category the frontend does not recognise
 * cannot render a screen whose submission the API would reject.
 */
export const gameCardMode = (category?: UserGameCategory): GAME_CARD_MODE => {
  switch (category) {
    case LIST_TYPE.FINISHED:
      return GAME_CARD_MODE.EDIT
    case LIST_TYPE.CURRENTLY_PLAYING:
      return GAME_CARD_MODE.FINISH
    default:
      return GAME_CARD_MODE.PLAY
  }
}
