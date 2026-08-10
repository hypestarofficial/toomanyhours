import { motion } from "motion/react"
import type { Variants } from "motion/react"
import { Image } from "@heroui/image"
import { ChatBubbleBottomCenterTextIcon, PuzzlePieceIcon, StarIcon } from "@heroicons/react/24/solid"
import { useDraggable } from "@dnd-kit/core"
import { cn } from "../../utils/cn"
import Badge from "../badge/Badge"
import { LIST_TYPE, LIST_TYPE_BADGE, LIST_TYPE_LABEL } from "../../helpers/enums"
import MotionTooltip from "../motionTooltip/MotionTooltip"
import { addOnSummary } from "./addOnSummary"
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
  /**
   * Whether the entry carries a review. Shown in both layouts, unlike the
   * rating: a review is the thing that makes a list worth reading, and whether
   * one exists is exactly what a visitor wants to spot without opening
   * anything.
   */
  hasReview?: boolean
  /**
   * The add-ons you have for this game, as plain title-and-status pairs rather
   * than entries — the card stays presentational and knows nothing about what
   * a list entry is.
   */
  addOns?: AddOnMark[]
}

export type AddOnMark = { title: string; category: LIST_TYPE }

/**
 * One overlay mark: an icon chip that explains itself on hover.
 *
 * Identical in both layouts on purpose. The row version used to spell "Written
 * review" out and print the score as text, which meant the two layouts said
 * the same things in two different languages.
 */
const Mark: React.FC<{ label: React.ReactNode; children: React.ReactNode; tooltipClassName?: string }> = ({
  label,
  children,
  tooltipClassName,
}) => (
  <MotionTooltip content={label} className={tooltipClassName}>
    <span className="bg-bg/80 text-primary flex items-center gap-1 rounded-lg px-1.5 py-1 shadow-md backdrop-blur-sm">{children}</span>
  </MotionTooltip>
)

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

const GameContainer: React.FC<GameContainerProps> = ({
  title,
  image,
  index,
  onClick,
  drag,
  overlay,
  layout,
  rating,
  hasReview,
  addOns,
}) => {
  const summary = addOnSummary(addOns ?? [])
  // Hooks cannot be conditional, so this always runs and is disabled when the
  // caller passes no drag payload. The fallback id is never used for a real
  // drop; it only keeps the id stable and unique among non-draggable cards.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: drag?.id ?? `static-${index}`,
    data: drag,
    disabled: !drag,
  })

  const isRow = layout === LIST_LAYOUT.ROWS

  const addOnMark = addOns && addOns.length > 0 && (
    <Mark
      tooltipClassName="max-w-64"
      label={
        <span className="flex flex-col gap-1 text-left">
          {summary.shown.map((addOn) => (
            <span key={addOn.title} className="flex items-center justify-between gap-2">
              <span className="truncate">{addOn.title}</span>
              <Badge variant={LIST_TYPE_BADGE[addOn.category]}>{LIST_TYPE_LABEL[addOn.category]}</Badge>
            </span>
          ))}
          {/* Counted, not dropped: the tooltip stops naming them but never
              under-reports how many you have. */}
          {summary.remaining > 0 && <span className="opacity-60">+{summary.remaining} more…</span>}
        </span>
      }
    >
      <span aria-label={`${addOns.length} add-ons in your list`} className="flex items-center gap-1">
        <PuzzlePieceIcon className="h-5 w-5" />
        <span className="text-xs font-semibold">{addOns.length}</span>
      </span>
    </Mark>
  )

  const reviewMark = hasReview && (
    <Mark label="Written review">
      <ChatBubbleBottomCenterTextIcon className="h-5 w-5" aria-label="Written review" />
    </Mark>
  )

  const ratingMark = rating != null && (
    <Mark label={`Rated ${rating} out of 10`}>
      <StarIcon className="h-5 w-5" aria-label={`Rated ${rating} out of 10`} />
      <span className="text-xs font-semibold">{rating}</span>
    </Mark>
  )

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
      {isRow ? (
        <Image src={image || placeholderImage} alt={title} className="pointer-events-none z-0 h-14 w-10 shrink-0 rounded-md object-cover" />
      ) : (
        // Relative only in the card layout, so the review mark can sit on the
        // cover. A row has room beside the title and needs no overlay.
        <div className="relative w-full">
          <Image
            src={image || placeholderImage}
            alt={title}
            className="pointer-events-none z-0 aspect-3/4 w-full rounded-md object-cover"
          />
          {/* Bottom of the cover, not the top: over the top edge these sat in
              the artwork's own busiest corner and went unnoticed. Add-ons take
              the left and the entry's own facts the right, so a game carrying
              both reads as two groups rather than one cluster. */}
          {addOnMark && <span className="absolute bottom-2 left-2 z-10">{addOnMark}</span>}
          {(reviewMark || ratingMark) && (
            <span className="absolute right-2 bottom-2 z-10 flex items-center gap-1">
              {reviewMark}
              {ratingMark}
            </span>
          )}
        </div>
      )}
      <span className={cn("line-clamp-1 text-sm", isRow ? "flex-1 text-left" : "text-center")}>{title}</span>
      {/* The same three marks as the cover carries. They used to be a spelled
          out badge and a bare "7/10", which meant the two layouts said the
          same things in two different languages. */}
      {(addOnMark || reviewMark || ratingMark) && isRow && (
        <span className="flex shrink-0 items-center gap-1 pr-1">
          {addOnMark}
          {reviewMark}
          {ratingMark}
        </span>
      )}
    </motion.button>
  )
}

export default GameContainer
