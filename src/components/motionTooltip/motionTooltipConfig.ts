import type { MotionProps } from "motion/react"

export type TooltipPlacement = "top" | "bottom" | "left" | "right"

/** Widest the bubble may get, and half of it, which the clamp below needs. */
export const TOOLTIP_MAX_WIDTH = 256
const HALF = TOOLTIP_MAX_WIDTH / 2
/** Breathing room kept between the bubble and the window edge. */
const MARGIN = 8

/**
 * How the bubble is offset from the point it is anchored to.
 *
 * These carry the translate, and they live on a *wrapper* rather than on the
 * animated element. Tailwind's `-translate-x-1/2` and Motion's animated `y`
 * both compile to `transform`, and Motion writes it as an inline style — so on
 * one element the animation silently wins and the bubble sits somewhere else
 * entirely. Splitting them is what keeps both.
 */
export const tooltipPosition: Record<TooltipPlacement, string> = {
  top: "-translate-x-1/2 -translate-y-full pb-2",
  bottom: "-translate-x-1/2 pt-2",
  left: "-translate-x-full -translate-y-1/2 pr-2",
  right: "-translate-y-1/2 pl-2",
}

/**
 * Where to pin the bubble, in viewport coordinates.
 *
 * Fixed rather than absolute because the bubble is portalled to the body: a
 * tooltip inside MotionCollapse would otherwise be cut off by the `overflow:
 * hidden` that section needs to animate its height, which is exactly what
 * happened to the add-on list on a card in the left column.
 *
 * The horizontal clamp keeps a centred bubble on screen when its trigger sits
 * near an edge. It assumes the widest the bubble may be, so a narrow one is
 * nudged further than it strictly needs — visibly on screen beats precisely
 * centred.
 */
export const tooltipCoords = (rect: DOMRect, placement: TooltipPlacement, viewportWidth: number) => {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // When the window is narrower than the bubble the clamp would invert, so
  // fall back to the middle of the window.
  const min = HALF + MARGIN
  const max = viewportWidth - HALF - MARGIN
  const clampedX = min > max ? viewportWidth / 2 : Math.min(Math.max(centerX, min), max)

  switch (placement) {
    case "bottom":
      return { left: clampedX, top: rect.bottom }
    case "left":
      return { left: rect.left, top: centerY }
    case "right":
      return { left: rect.right, top: centerY }
    default:
      return { left: clampedX, top: rect.top }
  }
}

/**
 * The bubble drifts in from the side it is anchored to, so the motion points
 * back at whatever the tooltip is describing.
 */
const offset: Record<TooltipPlacement, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
}

export const getMotionTooltipConfig = (placement: TooltipPlacement): MotionProps => ({
  initial: { opacity: 0, scale: 0.95, ...offset[placement] },
  animate: { opacity: 1, scale: 1, x: 0, y: 0 },
  exit: { opacity: 0, scale: 0.95, ...offset[placement] },
  transition: { duration: 0.15, ease: "easeOut" },
})
