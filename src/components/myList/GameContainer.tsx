import { motion } from "motion/react"
import type { Variants } from "motion/react"
import { Image } from "@heroui/image"
import placeholderImage from "../../assets/images/placeholder.webp"

// Presentational on purpose. It has two callers with different data — MyList
// renders list entries, Admin renders raw catalog games — so taking the two
// fields it actually displays keeps one card style instead of two components
// that drift apart.
type GameContainerProps = {
  title?: string
  image?: string
  index: number
  onClick?: () => void
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 1,
      ease: "easeInOut",
      type: "spring",
    },
  }),
  tap: {
    scale: 0.98,
    transition: { delay: 0, duration: 0.1 },
  },
  hover: {
    scale: 1.02,
  },
}

const GameContainer: React.FC<GameContainerProps> = ({ title, image, index, onClick }) => (
  <motion.button
    custom={index}
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    whileTap="tap"
    whileHover="hover"
    className="bg-secondaryBg flex flex-col items-center justify-start gap-4 rounded-xl p-3! select-none"
    onClick={onClick}
  >
    <Image src={image || placeholderImage} alt={title} className="pointer-events-none z-0 h-18 w-full rounded-md object-cover" />
    <span className="line-clamp-1 text-center text-sm">{title}</span>
  </motion.button>
)

export default GameContainer
