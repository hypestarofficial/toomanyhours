/**
 * The largest centred square inside a source image — what `object-fit: cover`
 * does, expressed as a source rectangle to draw from.
 *
 * Pure and tested because the canvas call around it cannot be: Vitest runs
 * `environment: "node"` here, so there is no `document`. The arithmetic is the
 * part that can be wrong, and getting it wrong squashes or off-centres every
 * photo that is not already square.
 *
 * Floored rather than rounded, so the rectangle can never start half a pixel
 * outside the source.
 */
export const coverRect = (srcW: number, srcH: number): { sx: number; sy: number; size: number } => {
  const size = Math.min(srcW, srcH)

  return {
    sx: Math.floor((srcW - size) / 2),
    sy: Math.floor((srcH - size) / 2),
    size,
  }
}
