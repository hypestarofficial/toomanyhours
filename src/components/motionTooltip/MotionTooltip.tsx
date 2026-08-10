import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "../../utils/cn"
import { getMotionTooltipConfig, tooltipCoords, tooltipPosition, TOOLTIP_MAX_WIDTH } from "./motionTooltipConfig"
import type { TooltipPlacement } from "./motionTooltipConfig"

type MotionTooltipProps = {
  /** What the tooltip says. A node, not a string, so it can hold rows, badges or markup. */
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
 * touch device at all. The trade is that this is still not a label — a control
 * whose only meaning lives in its tooltip is unusable on a phone either way,
 * so `aria-label` stays on the trigger where one is needed.
 *
 * **The bubble is portalled to the body and positioned fixed.** An absolutely
 * positioned one is clipped by any ancestor that hides its overflow, and
 * MotionCollapse hides its own in order to animate height — so a tooltip on a
 * card in a list section was cut off at the section's edge. Escaping to the
 * body is the only reliable fix.
 *
 * Opens on hover *and* focus, so it is reachable by keyboard. React's onFocus
 * bubbles, unlike the DOM event, so a focusable child opens it without the
 * wrapper taking a tab stop of its own.
 */
const MotionTooltip: React.FC<MotionTooltipProps> = ({ content, children, placement = "top", className }) => {
  const triggerRef = useRef<HTMLSpanElement>(null)
  // The trigger's box, measured when it opens. Holding the rect rather than a
  // boolean is what lets the portalled bubble know where to sit. It is not
  // re-measured on scroll: a hover ends the moment the pointer leaves, and a
  // keyboard focus that scrolls away is rare enough not to earn a listener on
  // every tooltip in the list.
  const [rect, setRect] = useState<DOMRect | null>(null)

  const open = () => triggerRef.current && setRect(triggerRef.current.getBoundingClientRect())
  const close = () => setRect(null)

  return (
    <span ref={triggerRef} className="relative inline-flex" onMouseEnter={open} onMouseLeave={close} onFocus={open} onBlur={close}>
      {children}

      {createPortal(
        <AnimatePresence>
          {rect && (
            // The wrapper holds the position and the offset translate; the
            // motion element inside holds the animation. Both on one element
            // and Motion's inline transform overwrites the translate.
            //
            // z-60 clears Modal's z-50, so a tooltip inside a dialog is not
            // painted beneath it. pointer-events-none so the bubble can never
            // swallow a click meant for what it describes.
            <span
              style={tooltipCoords(rect, placement, window.innerWidth)}
              className={cn("pointer-events-none fixed z-60", tooltipPosition[placement])}
            >
              <motion.span
                role="tooltip"
                {...getMotionTooltipConfig(placement)}
                style={{ maxWidth: TOOLTIP_MAX_WIDTH }}
                className={cn("bg-secondaryBg text-text block rounded-md px-2 py-1 text-xs font-medium shadow-lg", className)}
              >
                {content}
              </motion.span>
            </span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  )
}

export default MotionTooltip
