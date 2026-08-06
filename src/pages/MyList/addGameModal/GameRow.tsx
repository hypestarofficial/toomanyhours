import { AnimatePresence, motion } from "motion/react"
import { Image } from "@heroui/image"
import { CheckIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import Badge from "../../../components/badge/Badge"
import { colors } from "../../../utils/colors"
import { cn } from "../../../utils/cn"
import { MAX_SELECTED_GAMES } from "../../../helpers/constants"
import placeholderImage from "../../../assets/images/placeholder.webp"
import type { IGDBGame } from "../../../api/generated/models"
import { ROW_STATE } from "./rows"

// main_game is deliberately absent: it is most results, and a badge on almost
// every row is noise. The rest are worth flagging — "Blood and Wine" reads as
// a game until you see Expansion next to it.
const KIND_LABEL: Record<string, string> = {
  dlc: "DLC",
  expansion: "Expansion",
  standalone_expansion: "Standalone",
  bundle: "Bundle",
  episode: "Episode",
  season: "Season",
  remake: "Remake",
  remaster: "Remaster",
  expanded_game: "Expanded",
  port: "Port",
  fork: "Fork",
  mod: "Mod",
  pack_addon: "Pack",
  update: "Update",
  unknown: "Unknown",
}

type GameRowProps = {
  game: IGDBGame
  state: ROW_STATE
  onCheck: () => void
}

const GameRow: React.FC<GameRowProps> = ({ game, state, onCheck }) => {
  const isOwned = state === ROW_STATE.OWNED
  const isBlocked = state === ROW_STATE.BLOCKED
  const isChecked = state === ROW_STATE.SELECTED
  const disabled = isOwned || isBlocked

  // A search for "Grand Theft Auto V" returns three entries with identical
  // titles; the year is one of the two things that separates them.
  const year = game.releaseDate?.slice(0, 4)
  const kind = KIND_LABEL[game.kind]

  const handleClick = () => {
    if (isOwned) {
      toast.info("That one is already in your list")
      return
    }
    if (isBlocked) {
      toast.info(`You can only select up to ${MAX_SELECTED_GAMES} games`)
      return
    }
    onCheck()
  }

  return (
    <motion.div
      onClick={handleClick}
      whileHover={disabled ? undefined : { color: colors.primary }}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 select-none",
        isChecked ? "bg-secondaryBg" : !disabled && "hover:bg-highlight",
        disabled && "cursor-not-allowed! opacity-50!",
      )}
    >
      {/* 3:4, matching IGDB cover art, so the thumbnail is not cropped. */}
      <Image src={game.image || placeholderImage} alt={game.title} className="pointer-events-none h-12 w-9 shrink-0 rounded object-cover" />

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="line-clamp-1 text-sm">{game.title}</span>
        <span className="text-xs opacity-60">{year ?? "Unreleased"}</span>
      </div>

      {kind && <Badge variant="dark">{kind}</Badge>}
      {isOwned && <Badge>In your list</Badge>}

      <div className="relative h-5 w-5 shrink-0">
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
}

export default GameRow
