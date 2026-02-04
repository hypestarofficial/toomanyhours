import { motion } from "motion/react"
import type { Variants } from "motion/react"
import { Image } from "@heroui/image"
import type { Game } from "../../types/games"

type GameContainerProps = {
  game: Game
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

const GameContainer: React.FC<GameContainerProps> = ({ game, index, onClick }) => (
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
    <Image src={game.image} alt={game.title} className="pointer-events-none z-0 max-h-20 rounded-md object-cover" />
    <span className="line-clamp-1 text-center text-sm">{game.title}</span>
  </motion.button>
)

export default GameContainer
