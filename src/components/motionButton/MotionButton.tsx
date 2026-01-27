import { motion } from "framer-motion"
import { cn } from "../../utils/cn"
import { motionButtonConfig } from "./motionButtonConfig"
import type { RefObject } from "react"

type MotionButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  flex?: boolean
  size?: "menu" | "default"
  type?: "text" | "default"
  ref?: RefObject<HTMLButtonElement | null>
}

const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  onClick,
  className,
  disabled = false,
  flex = false,
  size = "default",
  type = "default",
  ref,
}) => {
  const sizeMap = {
    menu: "px-3! py-0.5! text-sm!",
    default: "px-6! py-2!",
  }

  return (
    <motion.button
      {...motionButtonConfig[disabled ? "disabled" : type]}
      whileTap={{
        scale: 0.9,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn(
        "rounded-md whitespace-nowrap select-none",
        flex && "w-full",
        sizeMap[size],
        disabled && "cursor-not-allowed! opacity-50!",
        className,
      )}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

export default MotionButton
