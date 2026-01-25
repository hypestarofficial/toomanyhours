import { Triangle } from "react-loader-spinner"
import { colors } from "../../utils/colors"
import { motion } from "motion/react"

type LoaderProps = {
  color?: string
  size?: "small" | "default"
}

const Loader: React.FC<LoaderProps> = ({ color = colors.primary, size = "default" }) => {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Triangle color={color} height={sizeMap[size].height} width={sizeMap[size].width} />
    </motion.div>
  )
}

export default Loader
