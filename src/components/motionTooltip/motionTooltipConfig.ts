import type { MotionProps } from "motion/react"

export type TooltipPlacement = "top" | "bottom" | "left" | "right"

/**
 * Where the bubble sits relative to its trigger.
 *
 * These carry the centring translate, and they live on a *wrapper* rather than
 * on the animated element. Tailwind's `-translate-x-1/2` and Motion's animated
 * `y` both compile to `transform`, and Motion writes it as an inline style —
 * so on one element the animation silently wins and the bubble sits off to the
 * side. Splitting them is what keeps both.
 */
export const tooltipPosition: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 pb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 pt-2",
  left: "right-full top-1/2 -translate-y-1/2 pr-2",
  right: "left-full top-1/2 -translate-y-1/2 pl-2",
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
