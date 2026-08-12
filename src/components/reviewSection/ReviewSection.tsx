type ReviewSectionProps = {
  /** Right of the label: a character counter while editing. */
  meta?: React.ReactNode
  /** The textarea, or the rendered text. Pads itself — see below. */
  children: React.ReactNode
}

/**
 * A review: one plain line saying what it is, then the box holding it.
 *
 * The label sits *above* the box rather than inside it. An in-card header with
 * a rule under it made the whole thing look like a panel with chrome, when all
 * it needs to say is "Review" and, while you are writing, how much room is
 * left.
 *
 * It frames both the editable review on your own card and the read-only one on
 * a shared profile, because they are the same thing seen from two sides — one
 * is the field you typed into, the other is what came out. Only the *body*
 * differs, and it differs by being passed in rather than by a prop telling this
 * component which mode it is in. That is the same reason `ListToolbar` takes
 * values and callbacks instead of a `variant`.
 *
 * **`focus-within` is on the box, unconditionally, and needs no flag.** The
 * editable body lights the ring when its textarea takes focus; the read-only
 * body holds nothing focusable, so the rule is simply inert there. That ring is
 * the one thing that must differ — without it a field does not read as a field.
 *
 * **The box has no padding of its own** and each caller pads identically. A
 * textarea must fill its container to be clickable at the edges, so padding on
 * the frame would leave a dead border you cannot click into.
 *
 * `h-40` both times: a card must be one height whichever game is open, or
 * opening two in a row resizes the modal under the cursor.
 */
const ReviewSection: React.FC<ReviewSectionProps> = ({ meta, children }) => (
  <div className="flex w-full flex-col gap-1.5">
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-semibold select-none">Review</span>
      {meta}
    </div>

    {/* relative so the body's own fade and the action below can sit over it. */}
    <div className="bg-secondaryBg focus-within:ring-primary/50 relative h-40 w-full overflow-hidden rounded-lg ring-1 ring-white/10 transition-shadow focus-within:ring-2">
      {/* relative above, so a body can absolutely position its own fade and
          Read more — which only the read-only one has, and only when the text
          is actually cut off. A slot here would have rendered it regardless. */}
      {children}
    </div>
  </div>
)

export default ReviewSection
