import { Triangle } from "react-loader-spinner"
import { colors } from "../../utils/colors"
import { motion } from "motion/react"
import { cn } from "../../utils/cn"

type LoaderProps = {
  color?: string
  size?: "small" | "default"
  fullPage?: boolean
}

const Loader: React.FC<LoaderProps> = ({ color = colors.primary, size = "default", fullPage = false }) => {
  const sizeMap = {
    small: {
      height: "1rem",
      width: "1rem",
    },
    default: {
      height: "4rem",
      width: "4rem",
    },
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex items-center justify-center", fullPage && "h-full w-full")}
    >
      <Triangle color={color} height={sizeMap[size].height} width={sizeMap[size].width} />
    </motion.div>
  )
}

export default Loader
