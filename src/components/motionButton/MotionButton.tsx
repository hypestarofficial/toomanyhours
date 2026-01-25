import { motion } from "framer-motion"
import { cn } from "../../utils/cn"
import { motionButtonConfig } from "./motionButtonConfig"
import type { RefObject } from "react"

type MotionButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  flex?: boolean
  size?: "menu" | "default"
  type?: "text" | "default"
  ref?: RefObject<HTMLButtonElement | null>
}

const MotionButton: React.FC<MotionButtonProps> = ({
  children,
  onClick,
  className,
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
      {...motionButtonConfig[type]}
      whileTap={{
        scale: 0.9,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn("rounded-md whitespace-nowrap select-none", flex ? "w-full" : "", sizeMap[size], className)}
      onClick={onClick}
      ref={ref}
    >
      {children}
    </motion.button>
  )
}

export default MotionButton
