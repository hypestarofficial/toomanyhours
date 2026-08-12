import { useLayoutEffect, useRef, useState } from "react"
import ReadMore from "../readMore/ReadMore"

type ReviewTextProps = {
  review?: string | null
  /** The game the review is of, for the Read more dialog's heading. */
  title?: string
  rating?: number | null
}

/**
 * A review rendered read-only inside `ReviewSection`, with a fade and a
 * Read more that appear **only when the text is actually cut off**.
 *
 * Both are measured rather than guessed: `scrollHeight > clientHeight` is a
 * fact about the rendered box, not the character-count heuristic that made the
 * old Show more toggle wrong. The first attempt here showed Read more whenever
 * a review existed, on the grounds that a redundant button is harmless — it is
 * not, it appears under three-word reviews and looks broken.
 *
 * **The bottom padding is reserved whether or not the button shows.** Measuring
 * a box whose padding depends on the measurement is a loop: reserve, then the
 * text fits, so the reservation goes, so it overflows again. Keeping `pb-12`
 * constant makes the measurement stable, at the cost of some empty space under
 * a short review — which the fixed-height box has anyway.
 *
 * A `ResizeObserver` re-measures when the card is resized, and the effect
 * re-runs when the review changes, because opening a different game reuses this
 * component rather than remounting it.
 */
const ReviewText: React.FC<ReviewTextProps> = ({ review, title, rating }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [review])

  return (
    <>
      <div ref={ref} className="h-full overflow-hidden px-3 py-2.5 pb-12">
        {review ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{review}</p>
        ) : (
          <p className="text-sm opacity-50">No review yet.</p>
        )}
      </div>

      {overflowing && (
        <>
          {/* Only over a cut line. On a review that fits, a gradient would be
              fading the box's own colour into itself for no reason. */}
          <div className="from-secondaryBg pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
          <div className="absolute right-2 bottom-2 z-10">
            <ReadMore text={review} title={title} rating={rating} />
          </div>
        </>
      )}
    </>
  )
}

export default ReviewText
