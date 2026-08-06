import type { MotionProps, Transition } from "motion/react"
import { colors } from "../../utils/colors"

export type MotionButtonVariant = "text" | "default" | "success" | "error" | "active"

type MotionButtonConfigParams = {
  disabled: boolean
  variant: MotionButtonVariant
}

export const getMotionButtonConfig = ({ disabled, variant }: MotionButtonConfigParams): MotionProps => {
  const transition: Transition = { duration: 0.3, ease: "easeInOut" }

  if (disabled) {
    return {
      animate: { backgroundColor: colors.secondaryBg, color: "#ffffff" },
      transition,
    }
  }

  const variants = {
    default: { bg: colors.secondaryBg, hoverBg: colors.hoverBg, text: "#ffffff", hoverText: colors.secondaryBg },
    success: { bg: colors.success, hoverBg: colors.hoverBg, text: "#ffffff", hoverText: colors.success },
    error: { bg: colors.error, hoverBg: colors.hoverBg, text: "#ffffff", hoverText: colors.error },
    text: { bg: "transparent", hoverBg: "transparent", text: "#ffffff", hoverText: colors.primary },
    // Selected state for a toggle group. None of the others means "selected" —
    // success is green and already means something else — so a pair of layout
    // buttons had no way to show which one is on.
    active: { bg: colors.primary, hoverBg: colors.primary, text: colors.bg, hoverText: colors.bg },
  }

  const current = variants[variant] || variants.default

  return {
    initial: { backgroundColor: current.bg, color: current.text },
    animate: { backgroundColor: current.bg, color: current.text },
    whileHover: { backgroundColor: current.hoverBg, color: current.hoverText },
    transition,
  }
}
