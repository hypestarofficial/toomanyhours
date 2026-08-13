/**
 * The formats the *server* can decode — `internal/images` registers gif, png
 * and jpeg and nothing else.
 *
 * The browser re-encodes to JPEG before uploading, so a WebP would in practice
 * survive the round trip; it is still refused here. Accepting a format the API
 * would reject makes the rule depend on which browser is doing the picking,
 * and the same file uploaded by any other means would 400.
 */
export const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/gif"]

/** Shown to the user, so the accepted set is stated rather than discovered. */
export const ACCEPTED_AVATAR_LABEL = "JPEG, PNG or GIF"

/**
 * A cap on the file *chosen*, not on what is sent.
 *
 * The upload itself is the 256x256 JPEG the canvas produces — about 20KB,
 * comfortably inside the API's 2MB body limit. This larger number exists only
 * to refuse decoding something absurd, and is well above any phone photo.
 */
export const MAX_AVATAR_FILE_BYTES = 10 * 1024 * 1024
export const MAX_AVATAR_FILE_LABEL = "10 MB"

/**
 * Why a chosen file cannot be used, or null when it can.
 *
 * Pure, and typed structurally rather than as `File`, so it is testable: Vitest
 * runs `environment: "node"` here and the component around it cannot be
 * rendered at all. This is a courtesy check — the server decodes and re-encodes
 * regardless — but it is the difference between naming the problem and letting
 * a .txt renamed to .jpg come back as a generic failure.
 */
export const avatarFileError = (file: { type: string; size: number }): string | null => {
  if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
    return `That file is not an image we can use. Pick a ${ACCEPTED_AVATAR_LABEL}.`
  }

  if (file.size > MAX_AVATAR_FILE_BYTES) {
    return `That image is over ${MAX_AVATAR_FILE_LABEL}. Pick a smaller one.`
  }

  return null
}
