import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import TextArea from "../../components/form/textArea/TextArea"
import StarRating from "./gameCard/StarRating"
import MotionIconButton from "../../components/motionIconButton/MotionIconButton"
import MotionTooltip from "../../components/motionTooltip/MotionTooltip"
import { TrashIcon } from "@heroicons/react/24/outline"

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
 * StarRating renders ten stars at h-7. Ten at h-10 came to about 480px and
 * overflowed the modal on a phone.
 */
const RatingFields: React.FC<RatingFieldsProps> = ({ control }) => (
  <div className="flex w-full flex-col items-center justify-center gap-4">
    <Controller
      name="review"
      control={control}
      render={({ field }) => <TextArea id="review" label="Review" placeholder="Write your review here..." sideLabel={false} {...field} />}
    />
    <Controller
      name="rating"
      control={control}
      render={({ field }) => (
        // Relative so the clear button can sit beside the stars without taking
        // part in centring them — the row stays centred whether or not there
        // is a rating to clear.
        <div className="relative flex w-full items-center justify-center">
          <StarRating maxStars={10} value={field.value} onChange={field.onChange} />

          {/* Only with a rating to remove. Ten stars have no "none" position,
              so without this the one thing you cannot do by clicking is take a
              score back — the score could be changed forever but never undone.
              0 is the form's unrated value and the API's clear sentinel, so
              this is exactly what saving an untouched entry would send. */}
          {field.value > 0 && (
            <span className="absolute top-1/2 right-0 -translate-y-1/2">
              <MotionTooltip content="Clear rating">
                <MotionIconButton icon={<TrashIcon className="h-5 w-5" />} onClick={() => field.onChange(0)} ariaLabel="Clear rating" />
              </MotionTooltip>
            </span>
          )}
        </div>
      )}
    />
  </div>
)

export default RatingFields
