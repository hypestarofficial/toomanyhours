import Input from "../../../components/form/input/Input"
import Modal from "../../../components/modal/Modal"
import type { Game } from "../../../types/games"
import MotionButton from "../../../components/motionButton/MotionButton"
import { toast } from "sonner"
import { Controller, Form, useForm, useWatch } from "react-hook-form"
import { useEffect } from "react"
import { Image } from "@heroui/image"
import dayjs from "dayjs"

type AddEditGameProps = {
  game?: Game | null
  isOpen: boolean
  onClose: () => void
}

const AddEditGame: React.FC<AddEditGameProps> = ({ game, isOpen, onClose }) => {
  const {
    control,
    clearErrors,
    formState: { isValid },
    setValue,
  } = useForm<Game>({
    defaultValues: {
      id: 0,
      title: "",
      image: "",
      releaseDate: dayjs().format("YYYY-MM-DD"),
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (isOpen && game) {
      setValue("id", game.id)
      setValue("title", game.title)
      setValue("image", game.image)
      setValue("releaseDate", dayjs(game.releaseDate).format("YYYY-MM-DD"))
    } else {
      setValue("id", 0)
      setValue("title", "")
      setValue("image", "")
      setValue("releaseDate", dayjs().format("YYYY-MM-DD"))
    }
  }, [game, isOpen, setValue])

  const onSubmit = (data: Game) => {
    console.log(data)
    toast.success("Game edited successfully")
    onClose()
  }

  const formData = useWatch({ control })

  useEffect(() => {
    clearErrors()
  }, [clearErrors, isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form control={control} onSubmit={({ data }) => onSubmit(data)} className="flex w-full flex-col gap-4">
        {game?.image && <Image src={game?.image} alt={game?.title} className="rounded-md" />}
        <div className="flex w-full flex-col gap-2">
          <Controller
            name="id"
            control={control}
            rules={{ required: "ID is required", min: { value: 1, message: "ID must be greater than 0" } }}
            render={({ field, formState: { errors } }) => (
              <Input type="number" id="gameId" label="ID" sideLabel={false} disabled={!!game} {...field} error={errors.id?.message} />
            )}
          />
          <Controller
            name="title"
            control={control}
            rules={{ required: "Title is required" }}
            render={({ field, formState: { errors } }) => (
              <Input
                type="text"
                id="gameTitle"
                label="Title"
                sideLabel={false}
                placeholder="Title"
                {...field}
                error={errors.title?.message}
              />
            )}
          />
          <Controller
            name="image"
            control={control}
            rules={{ required: "Image is required" }}
            render={({ field, formState: { errors } }) => (
              <Input
                type="text"
                id="gameImage"
                label="Image url"
                sideLabel={false}
                placeholder="Image url"
                {...field}
                error={errors.image?.message}
              />
            )}
          />
          <Controller
            name="releaseDate"
            control={control}
            rules={{ required: "Release date is required" }}
            render={({ field, formState: { errors } }) => (
              <Input
                type="date"
                id="gameReleaseDate"
                label="Release date"
                sideLabel={false}
                {...field}
                error={errors.releaseDate?.message}
              />
            )}
          />
          <pre className="bg-secondaryBg text-primary max-w-md overflow-x-auto rounded-md p-2 text-xs">
            {JSON.stringify(formData, null, 2)}
          </pre>
          <div className="flex items-center justify-center gap-2">
            <MotionButton flex type="submit" disabled={!isValid}>
              Edit Game
            </MotionButton>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default AddEditGame
