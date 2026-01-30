import { motion } from "motion/react"
import { cn } from "../../utils/cn"
import { getMotionButtonConfig } from "./motionButtonConfig"
import type { MotionButtonVariant } from "./motionButtonConfig"
import type { RefObject } from "react"

type MotionButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  flex?: boolean
  size?: "menu" | "default" | "icon"
  variant?: MotionButtonVariant
  ref?: RefObject<HTMLButtonElement | null>
  type?: "button" | "submit" | "reset"
  icon?: React.ReactNode
  noTap?: boolean
}

const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  onClick,
  className,
  disabled = false,
  flex = false,
  size = "default",
  variant = "default",
  ref,
  type = "button",
  noTap = false,
  icon,
}) => {
  const sizeMap = {
    menu: icon ? "px-1.5! py-0.5! text-sm!" : "px-3! py-0.5! text-sm!",
    default: icon ? "px-4! py-1.5!" : "px-6! py-2!",
    icon: "p-0!",
  }

  return (
    <motion.button
      {...getMotionButtonConfig({ disabled, variant })}
      whileTap={{
        scale: noTap ? 1 : 0.9,
      }}
      type={type}
      className={cn(
        "flex items-center justify-center rounded-md whitespace-nowrap select-none",
        flex && "w-full",
        icon && "gap-2",
        sizeMap[size],
        disabled && variant !== "text" && "bg-secondaryBg! cursor-not-allowed! opacity-50!",
        disabled && variant === "text" && "cursor-not-allowed! bg-transparent! opacity-50!",
        className,
      )}
      onClick={onClick}
      ref={ref}
      disabled={disabled}
    >
      {icon && icon}
      {children}
    </motion.button>
  )
}

export default MotionButton
