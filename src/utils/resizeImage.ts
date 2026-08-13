import { coverRect } from "./coverRect"

/** Matches the server's avatarSize; it re-encodes to this either way. */
const AVATAR_SIZE = 256

/**
 * Draws a chosen file to a 256x256 square and returns it as a JPEG blob.
 *
 * Three things fall out of going through a canvas: the EXIF rotation is applied
 * — a phone stores the sensor image plus a rotation tag, and Go's decoder
 * ignores that tag, so a portrait photo would otherwise land sideways — the
 * EXIF block is dropped, and a 4MB photo becomes about 20KB before it is ever
 * uploaded.
 *
 * **This is a convenience and never the validation.** The server decodes and
 * re-encodes regardless, because a client is not a place to enforce anything.
 * The accepted cost is that an upload from curl could still land rotated.
 *
 * `createImageBitmap` with `imageOrientation: "from-image"` is what applies the
 * rotation; without it Chrome draws the raw sensor pixels.
 */
export const resizeImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })

  try {
    const { sx, sy, size } = coverRect(bitmap.width, bitmap.height)

    const canvas = document.createElement("canvas")
    canvas.width = AVATAR_SIZE
    canvas.height = AVATAR_SIZE

    const context = canvas.getContext("2d")
    if (!context) throw new Error("Could not prepare that image")

    context.drawImage(bitmap, sx, sy, size, size, 0, 0, AVATAR_SIZE, AVATAR_SIZE)

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not prepare that image"))), "image/jpeg", 0.9)
    })
  } finally {
    // Frees the decoded pixels rather than waiting for the collector, which
    // matters when the source is a 12-megapixel phone photo.
    bitmap.close()
  }
}
