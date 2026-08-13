import type { PatchMeBody } from "../../api/endpoints/users"
import type { Visibility } from "../../types/users"
import { BIO_MAX_LENGTH, bioLength } from "./bio"

export type SettingsForm = {
  username: string
  bio: string
  visibility: Visibility
}

/** The account as stored, which is what "changed" is measured against. */
export type SavedSettings = {
  username: string
  bio: string | null
  visibility: Visibility
}

const USERNAME_MIN = 3
const USERNAME_MAX = 16
/** Mirrors internal/validate — the server stays the authority. */
const USERNAME_SHAPE = /^[a-z0-9_]+$/

/**
 * Only the fields that actually differ, normalized the way the API stores them.
 *
 * Sending the whole form every time would work, but this is what makes the
 * page's single Save honest: an untouched field is absent from the request
 * rather than rewritten with an identical value, so `PatchMe`'s "nothing to
 * update" guard means what it says.
 *
 * **A bio of `""` is the clear sentinel, not an omission.** The API cannot tell
 * an absent key from an explicit null, so emptying the box has to send `""` —
 * which is exactly why the null-versus-empty comparison below is not the
 * pedantry it looks like: a stored `null` and a typed `""` are the same state,
 * and treating them as different would mark a pristine form dirty forever.
 */
export const changedFields = (form: SettingsForm, saved: SavedSettings): PatchMeBody => {
  const patch: PatchMeBody = {}

  const username = form.username.trim().toLowerCase()
  if (username !== saved.username) patch.username = username

  const bio = form.bio.trim()
  if (bio !== (saved.bio ?? "")) patch.bio = bio

  if (form.visibility !== saved.visibility) patch.visibility = form.visibility

  return patch
}

/** Whether Save has anything to do. */
export const hasChanges = (form: SettingsForm, saved: SavedSettings): boolean => Object.keys(changedFields(form, saved)).length > 0

/**
 * Why Save cannot be pressed, or null when it can.
 *
 * A message rather than a boolean, because a disabled button with no
 * explanation is the failure this replaces: the old page silently disabled Save
 * on a two-character game tag and said nothing about why.
 *
 * It deliberately says nothing about a name being *taken*. That check is
 * advisory — two people can claim a name between the answer and the submit — so
 * the unique index stays the authority and the API's 409 is what reports it.
 * Only malformed input is blocked here, which is a fact the client can know.
 */
export const saveBlockedReason = (form: SettingsForm, saved: SavedSettings): string | null => {
  const patch = changedFields(form, saved)

  if (patch.username !== undefined) {
    if (patch.username.length < USERNAME_MIN) return `A game tag needs at least ${USERNAME_MIN} characters.`
    if (patch.username.length > USERNAME_MAX) return `A game tag is at most ${USERNAME_MAX} characters.`
    if (!USERNAME_SHAPE.test(patch.username)) return "A game tag can use lowercase letters, numbers and underscores."
  }

  if (patch.bio !== undefined && bioLength(patch.bio) > BIO_MAX_LENGTH) {
    return `Your bio is over ${BIO_MAX_LENGTH} characters.`
  }

  return null
}
