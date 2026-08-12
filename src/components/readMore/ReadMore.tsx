import { useState } from "react"
import { StarIcon } from "@heroicons/react/24/solid"
import Modal from "../modal/Modal"
import MotionButton from "../motionButton/MotionButton"

type ReadMoreProps = {
  text?: string | null
  /** The game the review is of. Falls back to a plain "Review" heading. */
  title?: string
  /** Out of ten, or null when unrated. */
  rating?: number | null
}

/**
 * Opens the full text of a review shown in a fixed-height box.
 *
 * The card caps the review so it is one height whichever game you open, which
 * means a long one is cut off — and reading a paragraph through a small window
 * is unpleasant. This is the way out.
 *
 * **The heading names the game and the score**, not just "Review". Opened from
 * a card the dialog covers, it otherwise gave no clue whose review you were
 * reading; the two facts that place it are which game it is about and what they
 * gave it.
 *
 * **It is shown whenever there is a review, rather than only when the text
 * actually overflows.** Knowing whether it overflows means comparing
 * scrollHeight to clientHeight after layout. This project has no component
 * tests, so that measurement would be unguarded — and a "Read more" on a short
 * review is merely redundant, while one that fails to appear on a long one
 * hides content. The harmless failure is the one to pick.
 *
 * Nesting a Modal inside a Modal is safe here: Modal refcounts the body scroll
 * lock, so closing this one does not unlock scrolling while the card is still
 * open.
 */
const ReadMore: React.FC<ReadMoreProps> = ({ text, title, rating }) => {
  const [open, setOpen] = useState(false)

  if (!text?.trim()) return null

  return (
    <>
      <MotionButton size="menu" variant="text" onClick={() => setOpen(true)}>
        Read more
      </MotionButton>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        {/* px-6 pb-6, and deliberately no top padding: Modal already renders an
            empty pt-10 header to hold the close button, so p-6 here stacked a
            second 24px on top of that 40px and left the title floating. */}
        <div className="flex w-full flex-col gap-3 px-6 pb-6 md:w-[36rem]">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-semibold select-none">{title ?? "Review"}</span>
            {rating != null && (
              <span className="text-primary flex items-center gap-1 text-sm font-semibold select-none">
                {rating}/10
                <StarIcon className="h-4 w-4" />
              </span>
            )}
          </div>
          {/* Bounded by the viewport rather than a fixed height: this dialog
              exists to show the whole thing, so it should be as tall as it can
              be and scroll only when the screen runs out. */}
          <p className="max-h-[60vh] overflow-y-auto pr-1 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      </Modal>
    </>
  )
}

export default ReadMore
