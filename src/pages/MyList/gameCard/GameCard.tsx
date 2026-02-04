import Modal from "../../../components/modal/Modal"
import type { Game } from "../../../types/games"
import { Image } from "@heroui/image"
import StarRating from "./StarRating"
import TextArea from "../../../components/form/textArea/TextArea"
import MotionButton from "../../../components/motionButton/MotionButton"
import { Controller, Form, useForm } from "react-hook-form"
import { handleError } from "../../../utils/errors"
import { toast } from "sonner"
import Badge from "../../../components/badge/Badge"

type GameCardProps = {
  game: Game | null
  onClose: () => void
}

type GameCardForm = {
  rating: number
  review: string
}

const GameCard: React.FC<GameCardProps> = ({ game, onClose }) => {
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
    try {
      console.log(data)
      toast.success("Game rated and reviewed successfully")
      close()
    } catch (error: unknown) {
      handleError({ error, userMessage: "An error occurred while rating and reviewing the game", componentName: "GameCard" })
    }
  }

  return (
    <Modal isOpen={!!game} onClose={() => close(false)}>
      <Form control={control} className="flex w-full flex-col items-center justify-center gap-6 p-6">
        <div className="flex w-full flex-col items-center justify-center gap-3">
          {game?.image && <Image src={game?.image} alt={game?.title} className="rounded-md" />}
          {game?.genres && (
            <div className="flex w-full flex-wrap items-center justify-start gap-1">
              {game.genres.map((genre) => (
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
