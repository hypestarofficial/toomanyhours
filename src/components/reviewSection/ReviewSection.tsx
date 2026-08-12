import { cn } from "../../utils/cn"

type ReviewSectionProps = {
  /** Right of the label: a character counter while editing, nothing while reading. */
  meta?: React.ReactNode
  /** Bottom right, under the box: Read more. */
  action?: React.ReactNode
  /** The textarea or the rendered text. */
  children: React.ReactNode
  /** Removes the box's own padding, for a body that needs to fill it edge to edge. */
  flush?: boolean
}

/**
 * The frame around a review: a label row, a fixed-height box, and a footer.
 *
 * It exists so the editable review on your own card and the read-only one on a
 * shared profile look like the same thing, because they are — one is the field
 * you typed into and the other is what came out. Only the *body* differs, and
 * it differs by being passed in rather than by a prop telling this component
 * which mode it is in. That is the same reason `ListToolbar` takes values and
 * callbacks instead of a `variant`: a branch inside a shared component is a
 * difference neither caller can see.
 *
 * **`h-40` on the box, both times.** A card must be one height whichever game
 * is open, or opening two in a row resizes the modal under the cursor. It is
 * also the reason the read-only side clamps rather than growing.
 */
const ReviewSection: React.FC<ReviewSectionProps> = ({ meta, action, children, flush = false }) => (
  <div className="flex w-full flex-col gap-1">
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-semibold select-none">Review</span>
      {meta}
    </div>

    <div className={cn("bg-secondaryBg h-40 w-full overflow-hidden rounded-md", !flush && "px-2 py-1.5")}>{children}</div>

    {/* Fixed-height row, so the box does not shift up when there is nothing to
        put in it — a card with a short review would otherwise sit differently
        from one with a long review, which is the jump this height exists to
        prevent in the first place. */}
    <div className="flex h-7 items-center justify-end">{action}</div>
  </div>
)

export default ReviewSection
