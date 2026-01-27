import { motion } from "motion/react"
import { Image } from "@heroui/image"
import type { Game } from "../../types/games"

type GameContainerProps = {
  game: Game
  index: number
}

const GameContainer: React.FC<GameContainerProps> = ({ game, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeInOut", delay: index * 0.05, type: "spring" }}
    className="bg-secondaryBg flex flex-col items-center justify-center gap-4 rounded-xl p-3!"
  >
    <Image src={game.image} alt={game.title} width={250} className="pointer-events-none z-0 rounded-md select-none" />
    <span className="text-center text-sm">{game.title}</span>
  </motion.button>
)

export default GameContainer
