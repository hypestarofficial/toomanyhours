import { useState } from "react"
import Modal from "../modal/Modal"
import MotionButton from "../motionButton/MotionButton"

type ReadMoreProps = {
  text?: string | null
  /** Heading inside the dialog. The label of whatever box this sits under. */
  title?: string
}

/**
 * Opens the full text of something that is shown in a fixed-height box.
 *
 * Both game cards cap their review at a fixed height so the card is one height
 * whichever game you open — the same reason GameSummary once had. The cost is
 * that a long review is cut off, and scrolling inside a small box inside a
 * modal is an unpleasant way to read a paragraph. This is the way out.
 *
 * **It is shown whenever there is a review, rather than only when the text
 * actually overflows.** Knowing whether it overflows means comparing
 * scrollHeight to clientHeight after layout, and re-measuring on every
 * keystroke in the editable case. This project has no component tests, so that
 * measurement would be unguarded — and a "Read more" on a short review is
 * merely redundant, while one that fails to appear on a long one hides content.
 * The harmless failure is the one to pick.
 *
 * Nesting a Modal inside a Modal is safe here: Modal refcounts the body scroll
 * lock, so closing this one does not unlock scrolling while the card is still
 * open.
 */
const ReadMore: React.FC<ReadMoreProps> = ({ text, title = "Review" }) => {
  const [open, setOpen] = useState(false)

  if (!text?.trim()) return null

  return (
    <>
      <MotionButton size="menu" variant="text" onClick={() => setOpen(true)}>
        Read more
      </MotionButton>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div className="flex w-full flex-col gap-2 p-6 md:w-[36rem]">
          <span className="font-semibold select-none">{title}</span>
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
