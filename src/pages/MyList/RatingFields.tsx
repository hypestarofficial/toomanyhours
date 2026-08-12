import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import StarRating from "./gameCard/StarRating"
import MotionIconButton from "../../components/motionIconButton/MotionIconButton"
import MotionTooltip from "../../components/motionTooltip/MotionTooltip"
import ReviewSection from "../../components/reviewSection/ReviewSection"
import ReadMore from "../../components/readMore/ReadMore"
import { TrashIcon } from "@heroicons/react/24/outline"
import { cn } from "../../utils/cn"
import { textLength } from "../../utils/textLength"
import { REVIEW_MAX_LENGTH } from "../../list/review"

// One shape, shared by the detail modal and step 2 of the add flow, so the
// component below can be typed concretely rather than generically.
//
// 0 means unrated. On PATCH that is the API's "clear my rating" sentinel; on
// POST it is rejected, so the add path must omit the field rather than send it.
export type RatingFormValues = {
  rating: number
  review: string
}

type RatingFieldsProps = {
  control: Control<RatingFormValues>
}

/**
 * The rating and review pair, rendered identically wherever an entry is scored.
 *
 * Neither field carries a validation rule, and that is the point. Rating and
 * review are optional: the API has always accepted a finished entry with
 * neither, and dragging a card into finished sets no rating. The detail modal
 * used to require a rating, which made the app disagree with its own API and
 * with VISION.md — "a list with a few scored standouts reads better than one
 * where every entry has a dutiful number".
 *
 * The review is a bare textarea inside `ReviewSection` rather than the
 * `TextArea` component, so it is visually the same box the public profile
 * renders: one holds a field and the other holds text, and they should not look
 * like different features. `TextArea` brings its own label and background,
 * which would have meant a box inside a box.
 *
 * StarRating renders ten stars at h-7. Ten at h-10 came to about 480px and
 * overflowed the modal on a phone.
 */
const RatingFields: React.FC<RatingFieldsProps> = ({ control }) => (
  <div className="flex w-full flex-col items-center justify-center gap-4">
    <Controller
      name="review"
      control={control}
      render={({ field }) => {
        const count = textLength(field.value)
        const tooLong = count > REVIEW_MAX_LENGTH

        return (
          <ReviewSection
            flush
            // Counted the server's way — `.length` would disagree on emoji and
            // block a save the API would have accepted.
            meta={
              <span className={cn("text-xs tabular-nums", tooLong ? "text-error font-semibold" : "opacity-60")}>
                {count.toLocaleString()} / {REVIEW_MAX_LENGTH.toLocaleString()}
              </span>
            }
            action={<ReadMore text={field.value} />}
          >
            {/* No maxLength: pasting past the limit would silently drop the end
                and the writer would never find out. The counter says so and the
                save button refuses instead. */}
            <textarea
              id="review"
              placeholder="Write your review here..."
              spellCheck="false"
              className="h-full w-full resize-none bg-transparent px-2 py-1.5 text-sm leading-5 outline-none placeholder:opacity-50"
              {...field}
            />
          </ReviewSection>
        )
      }}
    />
    <Controller
      name="rating"
      control={control}
      render={({ field }) => (
        // The button is in the flow rather than absolute now, so the pair
        // is centred as a group rather than the stars being centred with the
        // button hanging off one side. The trade is that the stars shift right
        // by the button's width the first time a rating is set — once, and
        // only when going from unrated to rated.
        <div className="flex w-full items-center justify-center gap-3">
          {field.value > 0 && (
            <MotionTooltip content="Clear rating">
              <MotionIconButton icon={<TrashIcon className="h-5 w-5" />} onClick={() => field.onChange(0)} ariaLabel="Clear rating" />
            </MotionTooltip>
          )}
          <StarRating maxStars={10} value={field.value} onChange={field.onChange} />
        </div>
      )}
    />
  </div>
)

export default RatingFields
