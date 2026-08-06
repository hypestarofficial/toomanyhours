import { motion } from "motion/react"
import type { Variants } from "motion/react"
import { Image } from "@heroui/image"
import { StarIcon } from "@heroicons/react/24/solid"
import { useDraggable } from "@dnd-kit/core"
import { cn } from "../../utils/cn"
import placeholderImage from "../../assets/images/placeholder.webp"
// One import covers both uses: LIST_LAYOUT is declared as a const *and* a type
// of the same name.
import { LIST_LAYOUT } from "../../store/useUserSettingsAuth"

// Presentational on purpose: it takes the fields it displays rather than an
// entry. It had two callers with different data until the admin page was
// deleted, and MyList is now the only one — but a card that takes a title and
// an image is still the right shape, and the drag payload stays opt-in so a
// second read-only caller costs nothing.
type GameContainerProps = {
  title?: string
  image?: string
  index: number
  onClick?: () => void
  // Opt-in: makes the card draggable and carries what the drop handler needs.
  // A caller that passes nothing gets an inert card.
  drag?: { id: number; gameId: number; category: string }
  // Rendered inside dnd-kit's DragOverlay — the card that follows the cursor.
  // Skips the entrance animation, which would otherwise fade the card in every
  // time a drag starts, and takes lifted styling so it reads as picked up
  // rather than merely duplicated.
  overlay?: boolean
  layout?: LIST_LAYOUT
  /** Shown at the row's right edge. Rows have horizontal room cards do not. */
  rating?: number | null
}

// Cards past this index all arrive together, 0.6s in.
const STAGGER_CAP = 12

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      // Capped. The delay is per card, so an uncapped stagger scales linearly
      // with the section: with a hundred games the last card appeared five
      // seconds after the first, which read as the page being slow when the
      // data had in fact already arrived. A dozen cards is enough to register
      // as a cascade; past that it is just waiting. Lists shorter than the cap
      // animate exactly as they did before.
      delay: Math.min(i, STAGGER_CAP) * 0.05,
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

const GameContainer: React.FC<GameContainerProps> = ({ title, image, index, onClick, drag, overlay, layout, rating }) => {
  // Hooks cannot be conditional, so this always runs and is disabled when the
  // caller passes no drag payload. The fallback id is never used for a real
  // drop; it only keeps the id stable and unique among non-draggable cards.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: drag?.id ?? `static-${index}`,
    data: drag,
    disabled: !drag,
  })

  const isRow = layout === LIST_LAYOUT.ROWS

  return (
    <motion.button
      ref={setNodeRef}
      custom={index}
      variants={overlay ? undefined : containerVariants}
      initial={overlay ? undefined : "hidden"}
      animate={overlay ? undefined : "visible"}
      // Rows opt out of the scale variants: a card has slack around it in the
      // grid, but a row is full width, so scaling it up pushes it past the
      // container edge. They get a background change instead, which reads the
      // same and cannot overflow.
      whileTap={overlay || isRow ? undefined : "tap"}
      whileHover={overlay || isRow ? undefined : "hover"}
      className={cn(
        "bg-secondaryBg flex rounded-xl select-none",
        isRow
          ? "hover:bg-highlight w-full items-center justify-start gap-3 p-2! transition-colors"
          : "flex-col items-center justify-start gap-4 p-3!",
        drag && !overlay && "cursor-grab active:cursor-grabbing",
        overlay && "ring-highlight scale-105 rotate-3 cursor-grabbing shadow-2xl ring-2",
      )}
      onClick={onClick}
      // The card left behind is faded rather than hidden: removing it from the
      // grid mid-drag would reflow the other cards under the cursor.
      style={{ opacity: isDragging ? 0.3 : 1 }}
      {...listeners}
      {...attributes}
    >
      {/* Both shapes are 3:4, matching IGDB cover art (t_cover_big is 264x352).
          A landscape box here threw away the top and bottom of every cover:
          IGDB does publish horizontal screenshots and artworks, but the cover
          is the box art and box art is portrait. */}
      <Image
        src={image || placeholderImage}
        alt={title}
        className={cn("pointer-events-none z-0 rounded-md object-cover", isRow ? "h-14 w-10 shrink-0" : "aspect-3/4 w-full")}
      />
      <span className={cn("line-clamp-1 text-sm", isRow ? "flex-1 text-left" : "text-center")}>{title}</span>
      {/* Solid, matching the filled stars in the modal. The icon inherits
          text-primary from the span, so number and star are the same colour. */}
      {isRow && rating != null && (
        <span className="text-primary flex shrink-0 items-center gap-1 pr-2 text-sm font-semibold">
          {rating}/10
          <StarIcon className="h-4 w-4" />
        </span>
      )}
    </motion.button>
  )
}

export default GameContainer
