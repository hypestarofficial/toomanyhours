import { motion } from "motion/react"
import { colors } from "../../utils/colors"

type MotionTextProps = {
  children: React.ReactNode
  className?: string
  duration?: number
}

const MotionText: React.FC<MotionTextProps> = ({ children, className, duration = 0.3 }) => (
  <motion.span
    initial={{ color: colors.defaultText }}
    whileHover={{ color: colors.primary }}
    transition={{ duration }}
    className={className}
  >
    {children}
  </motion.span>
)

export default MotionText
