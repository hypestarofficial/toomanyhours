import { motion, type MotionProps } from "motion/react"

type MotionContainerProps = {
  children: React.ReactNode
  className?: string
  type?: "ease" | "spring"
}

const motionContainerConfig: Record<NonNullable<MotionContainerProps["type"]>, MotionProps> = {
  ease: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  spring: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, type: "spring" },
  },
}

const MotionContainer: React.FC<MotionContainerProps> = ({ children, className, type = "spring" }) => (
  <motion.div {...motionContainerConfig[type]} className={className}>
    {children}
  </motion.div>
)

export default MotionContainer
