import { motion } from "motion/react"
import type { Variants } from "motion/react"
import { Image } from "@heroui/image"
import { useDraggable } from "@dnd-kit/core"
import { cn } from "../../utils/cn"
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
  // Present only in MyList: makes the card draggable and carries what the drop
  // handler needs. Admin's catalog cards pass nothing and stay inert.
  drag?: { id: number; gameId: number; category: string }
  // Rendered inside dnd-kit's DragOverlay — the card that follows the cursor.
  // Skips the entrance animation, which would otherwise fade the card in every
  // time a drag starts, and takes lifted styling so it reads as picked up
  // rather than merely duplicated.
  overlay?: boolean
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

const GameContainer: React.FC<GameContainerProps> = ({ title, image, index, onClick, drag, overlay }) => {
  // Hooks cannot be conditional, so this always runs and is disabled when the
  // caller passes no drag payload. The fallback id is never used for a real
  // drop; it only keeps the id stable and unique among non-draggable cards.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: drag?.id ?? `static-${index}`,
    data: drag,
    disabled: !drag,
  })

  return (
    <motion.button
      ref={setNodeRef}
      custom={index}
      variants={overlay ? undefined : containerVariants}
      initial={overlay ? undefined : "hidden"}
      animate={overlay ? undefined : "visible"}
      whileTap={overlay ? undefined : "tap"}
      whileHover={overlay ? undefined : "hover"}
      className={cn(
        "bg-secondaryBg flex flex-col items-center justify-start gap-4 rounded-xl p-3! select-none",
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
      <Image src={image || placeholderImage} alt={title} className="pointer-events-none z-0 h-18 w-full rounded-md object-cover" />
      <span className="line-clamp-1 text-center text-sm">{title}</span>
    </motion.button>
  )
}

export default GameContainer
