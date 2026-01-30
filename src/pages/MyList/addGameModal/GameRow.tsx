import { AnimatePresence, motion } from "motion/react"
import type { Game } from "../../../types/games"
import { CheckIcon } from "@heroicons/react/24/outline"
import { colors } from "../../../utils/colors"
import { cn } from "../../../utils/cn"
import { toast } from "sonner"
import { MAX_SELECTED_GAMES } from "../../../helpers/constants"

type GameRowProps = {
  game: Game
  isChecked: boolean
  onCheck: () => void
  disabled?: boolean
}

const GameRow: React.FC<GameRowProps> = ({ game, isChecked, onCheck, disabled }) => (
  <motion.div
    onClick={disabled ? () => toast.info(`You can only select up to ${MAX_SELECTED_GAMES} games`) : onCheck}
    whileHover={{ color: colors.primary }}
    className={cn(
      "flex cursor-pointer items-center justify-between rounded-md px-2 py-1 select-none",
      isChecked ? "bg-secondaryBg" : "hover:bg-highlight",
      disabled && "cursor-not-allowed! opacity-50!",
    )}
  >
    <span className="text-sm">{game.title}</span>
    <div className="relative h-5 w-5">
      <AnimatePresence>
        {isChecked && (
          <motion.span
            className="absolute top-0 right-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CheckIcon className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
)

export default GameRow
