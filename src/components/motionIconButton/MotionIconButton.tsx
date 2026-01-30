import { motion } from "motion/react"
import { cn } from "../../utils/cn"
import { motionIconButtonConfig } from "./motionIconButtonConfig"
import type { RefObject } from "react"

type MotionIconButtonProps = {
  onClick?: () => void
  className?: string
  disabled?: boolean
  ref?: RefObject<HTMLButtonElement | null>
  icon: React.ReactNode
}

const MotionIconButton: React.FC<MotionIconButtonProps> = ({ onClick, className, disabled = false, ref, icon }) => (
  <motion.button
    {...motionIconButtonConfig[disabled ? "disabled" : "default"]}
    whileTap={{
      scale: 0.9,
    }}
    transition={{
      duration: 0.3,
      ease: "easeInOut",
    }}
    type="button"
    className={cn(
      "flex items-center justify-center rounded-full p-0! whitespace-nowrap select-none",
      disabled && "cursor-not-allowed! opacity-50!",
      className,
    )}
    onClick={onClick}
    ref={ref}
    disabled={disabled}
  >
    <span className="flex h-6 w-6 items-center justify-center">{icon}</span>
  </motion.button>
)

export default MotionIconButton
