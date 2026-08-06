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
import { gameCardMode, GAME_CARD_MODE } from "./gameCardMode"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"

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

  const mode = gameCardMode(entry?.category)
  const showsForm = mode !== GAME_CARD_MODE.PLAY

  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<GameCardForm>({
    // isValid must be live: the primary button is disabled until a rating is
    // picked, and with the default onSubmit mode it would only become accurate
    // after the first rejected submit.
    mode: "onChange",
    defaultValues: {
      rating: 0,
      review: "",
    },
  })

  // defaultValues are only read on first mount, so without this the form keeps
  // whatever the previously opened game had — and saving would overwrite this
  // entry's review with the last one's.
  //
  // Prefills in FINISH mode too, where the stored values may be from an earlier
  // playthrough. Starting blank there would submit an empty review over a real
  // one, so the kept data would survive only until the next Finish.
  useEffect(() => {
    reset({ rating: apiRatingToForm(entry?.rating), review: entry?.review ?? "" })
  }, [entry, reset])

  const close = (skip?: boolean) => {
    if (skip) {
      toast.info("No worries, you can rate and review it later")
    }
    reset()
    onClose()
  }

  // Play! is a category-only PATCH — the same request dragging sends, which the
  // API's rating rule already permits.
  const onPlay = async () => {
    if (!entry) return

    try {
      await updateEntry({ gameId: entry.gameId, data: { category: LIST_TYPE.CURRENTLY_PLAYING } })
      toast.success(`${entry.game?.title ?? "Game"} → ${LIST_TYPE_LABEL[LIST_TYPE.CURRENTLY_PLAYING]}`)
      close()
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not start that game", componentName: "GameCard" })
    }
  }

  const onSubmit = async (data: GameCardForm) => {
    if (!entry) return

    const finishing = mode === GAME_CARD_MODE.FINISH

    try {
      // The category rides along when finishing, so the move and the rating are
      // one request. Two would leave the entry finished-but-unrated if the
      // second failed — and the API judges the resulting category precisely so
      // this does not have to be split.
      await updateEntry({
        gameId: entry.gameId,
        data: {
          ...(finishing ? { category: LIST_TYPE.FINISHED } : {}),
          rating: formRatingToApi(data.rating),
          review: data.review,
        },
      })
      toast.success(finishing ? `${entry.game?.title ?? "Game"} → ${LIST_TYPE_LABEL[LIST_TYPE.FINISHED]}` : "Saved")
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

        {/* PLAY mode shows neither field, even when the row holds a rating from
            a previous stint in finished. */}
        {showsForm && (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Controller
              name="review"
              control={control}
              render={({ field }) => (
                <TextArea id={"review"} label="Review" placeholder="Write your review here..." sideLabel={false} {...field} />
              )}
            />
            <Controller
              name="rating"
              control={control}
              // Required, replacing the old "at least one of rating or review".
              // A form rule only: dragging a card into finished sets no rating,
              // so the API cannot require one and must keep accepting unrated
              // finished entries.
              rules={{ validate: (value: number) => value > 0 || "Pick a rating" }}
              render={({ field }) => <StarRating maxStars={5} value={field.value} onChange={field.onChange} />}
            />
          </div>
        )}

        <div className="flex w-full gap-2">
          {mode === GAME_CARD_MODE.FINISH ? (
            <MotionButton onClick={() => close(true)}>Skip</MotionButton>
          ) : (
            <MotionButton onClick={() => close(false)}>Cancel</MotionButton>
          )}

          {mode === GAME_CARD_MODE.PLAY && (
            <MotionButton variant="success" flex onClick={onPlay}>
              Play!
            </MotionButton>
          )}
          {mode === GAME_CARD_MODE.FINISH && (
            <MotionButton variant="success" flex onClick={handleSubmit(onSubmit)} disabled={!isValid}>
              Finish
            </MotionButton>
          )}
          {mode === GAME_CARD_MODE.EDIT && (
            <MotionButton variant="success" flex onClick={handleSubmit(onSubmit)} disabled={!isValid}>
              Save
            </MotionButton>
          )}
        </div>
      </Form>
    </Modal>
  )
}

export default GameCard
