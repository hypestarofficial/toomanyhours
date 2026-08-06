import { useEffect } from "react"
import Modal from "../../../components/modal/Modal"
import type { UserGame } from "../../../api/generated/models"
import { Image } from "@heroui/image"
import StarRating from "./StarRating"
import TextArea from "../../../components/form/textArea/TextArea"
import MotionButton from "../../../components/motionButton/MotionButton"
import { Controller, Form, useForm } from "react-hook-form"
import { handleError } from "../../../utils/errors"
import { toast } from "sonner"
import Badge from "../../../components/badge/Badge"
import { useUpdateEntry } from "../../../api/userGames"

type GameCardProps = {
  entry: UserGame | null
  onClose: () => void
}

type GameCardForm = {
  rating: number
  review: string
}

// StarRating shows 5 stars with half-steps, so the form value runs 0-5 in
// increments of 0.5. The API stores an integer 1-10. Doubling is the mapping
// VISION.md anticipated when it chose a 10-point scale that keeps the existing
// star component viable — half a star is 1, five stars is 10.
//
// Zero survives the round trip in both directions, which matters: 0 is the
// API's "clear my rating" sentinel.
const formRatingToApi = (value: number) => Math.round(value * 2)
const apiRatingToForm = (value: number | null | undefined) => (value ?? 0) / 2

const GameCard: React.FC<GameCardProps> = ({ entry, onClose }) => {
  const { mutateAsync: updateEntry } = useUpdateEntry()

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid, errors },
  } = useForm<GameCardForm>({
    defaultValues: {
      rating: 0,
      review: "",
    },
  })

  // defaultValues are only read on first mount, so without this the form keeps
  // whatever the previously opened game had — and saving would overwrite this
  // entry's review with the last one's.
  useEffect(() => {
    reset({ rating: apiRatingToForm(entry?.rating), review: entry?.review ?? "" })
  }, [entry, reset])

  const validateAtLeastOne = () => {
    const values = getValues()
    return values.rating > 0 || values.review.trim().length > 0 || "Fill at least one"
  }

  const close = (skip?: boolean) => {
    if (skip) {
      toast.info("No worries, you can rate and review it later")
    }
    reset()
    onClose()
  }

  const onSubmit = async (data: GameCardForm) => {
    if (!entry) return

    try {
      // Sent as-is otherwise: rating 0 and review "" are the API's clear
      // sentinels, so removing a rating in the form clears it on the server.
      await updateEntry({
        gameId: entry.gameId,
        data: { rating: formRatingToApi(data.rating), review: data.review },
      })
      toast.success("Saved")
      close()
    } catch (error: unknown) {
      handleError({ error, userMessage: "An error occurred while rating and reviewing the game", componentName: "GameCard" })
    }
  }

  return (
    <Modal isOpen={!!entry} onClose={() => close(false)}>
      <Form control={control} className="flex w-full flex-col items-center justify-center gap-6 p-6">
        <div className="flex w-full flex-col items-center justify-center gap-3">
          {entry?.game?.image && <Image src={entry.game.image} alt={entry.game.title} className="rounded-md" />}
          {entry?.game?.genres && (
            <div className="flex w-full flex-wrap items-center justify-start gap-1">
              {entry.game.genres.map((genre) => (
                <Badge variant="dark" key={genre.id}>
                  {genre.genre}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Controller
            name="review"
            control={control}
            rules={{
              validate: validateAtLeastOne,
            }}
            render={({ field }) => (
              <TextArea id={"review"} label="Review" placeholder="Write your review here..." sideLabel={false} {...field} />
            )}
          />
          <Controller
            name="rating"
            rules={{ validate: validateAtLeastOne }}
            control={control}
            render={({ field }) => <StarRating maxStars={5} value={field.value} onChange={field.onChange} />}
          />
        </div>
        {errors.root?.message && <p className="errorStr">{errors.root?.message}</p>}
        <div className="flex w-full gap-2">
          <MotionButton onClick={() => close(true)}>Skip</MotionButton>
          <MotionButton variant="success" flex onClick={handleSubmit(onSubmit)} disabled={!isValid}>
            Rate and Review
          </MotionButton>
        </div>
      </Form>
    </Modal>
  )
}

export default GameCard
