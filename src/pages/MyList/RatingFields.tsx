import { Controller } from "react-hook-form"
import type { Control } from "react-hook-form"
import TextArea from "../../components/form/textArea/TextArea"
import StarRating from "./gameCard/StarRating"

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
      render={({ field }) => <StarRating maxStars={10} value={field.value} onChange={field.onChange} />}
    />
  </div>
)

export default RatingFields
