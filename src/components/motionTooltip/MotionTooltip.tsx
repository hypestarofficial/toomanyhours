import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "../../utils/cn"
import { getMotionTooltipConfig, tooltipPosition } from "./motionTooltipConfig"
import type { TooltipPlacement } from "./motionTooltipConfig"

type MotionTooltipProps = {
  /** What the tooltip says. A node, not a string, so it can hold an icon or markup. */
  content: React.ReactNode
  /** What it describes. */
  children: React.ReactNode
  placement?: TooltipPlacement
  /** Classes for the bubble, not the trigger. */
  className?: string
}

/**
 * A tooltip that animates, replacing the browser's `title` attribute.
 *
 * `title` was doing this job and doing it badly: it waits about a second,
 * renders in the OS's styling rather than the app's, and never appears on a
 * touch device at all. The trade is that this one is not a replacement for a
 * label — a control whose only meaning lives in its tooltip is still unusable
 * on a phone, so `aria-label` stays on the trigger where one is needed.
 *
 * Opens on hover *and* focus, so it is reachable by keyboard. React's onFocus
 * bubbles, unlike the DOM event, so a focusable child opens it without the
 * wrapper having to take a tab stop of its own.
 */
const MotionTooltip: React.FC<MotionTooltipProps> = ({ content, children, placement = "top", className }) => {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}

      <AnimatePresence>
        {open && (
          // The wrapper holds the position and the centring translate; the
          // motion element inside holds the animation. Both on one element and
          // Motion's inline transform overwrites the centring.
          //
          // pointer-events-none so the bubble can never swallow a click meant
          // for what it is describing — including the card underneath it.
          <span className={cn("pointer-events-none absolute z-50", tooltipPosition[placement])}>
            <motion.span
              role="tooltip"
              {...getMotionTooltipConfig(placement)}
              className={cn(
                "bg-secondaryBg text-text block rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-lg",
                className,
              )}
            >
              {content}
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  )
}

export default MotionTooltip
