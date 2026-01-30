import Input from "../../../components/form/input/Input"
import Modal from "../../../components/modal/Modal"
import type { Game } from "../../../types/games"
import MotionButton from "../../../components/motionButton/MotionButton"
import { toast } from "sonner"
import { Controller, Form, useForm, useWatch } from "react-hook-form"
import { useCallback, useEffect } from "react"
import { Image } from "@heroui/image"
import dayjs from "dayjs"
import Checkbox from "../../../components/form/checkbox/Checkbox"
import { useGenresQuery } from "../../../api/endpoints/useQuery"
import Loader from "../../../components/loader/Loader"

type AddEditGameProps = {
  game?: Game | null
  isOpen: boolean
  onClose: () => void
}

type AddEditGameForm = {
  id: number
  title: string
  image: string
  releaseDate: string
  genres: number[]
}

const AddEditGame: React.FC<AddEditGameProps> = ({ game, isOpen, onClose }) => {
  const { data: genres } = useGenresQuery()
  const {
    control,
    clearErrors,
    handleSubmit,
    formState: { isValid },
    setValue,
  } = useForm<AddEditGameForm>({
    defaultValues: {
      id: 0,
      title: "",
      image: "",
      releaseDate: dayjs().format("YYYY-MM-DD"),
      genres: [],
    },
    mode: "onChange",
  })

  const resetFields = useCallback(() => {
    if (!game) return
    setValue("id", game.id)
    setValue("title", game.title)
    setValue("image", game.image)
    setValue("releaseDate", dayjs(game.releaseDate).format("YYYY-MM-DD"))
    setValue("genres", game.genres.map((genre) => genre.id) ?? [])
  }, [game, setValue])

  useEffect(() => {
    if (isOpen && game) {
      resetFields()
    } else {
      setValue("id", 0)
      setValue("title", "")
      setValue("image", "")
      setValue("releaseDate", dayjs().format("YYYY-MM-DD"))
      setValue("genres", [])
    }
  }, [game, isOpen, resetFields, setValue])

  const onSubmit = (data: AddEditGameForm) => {
    console.log(data)
    toast.success("Game edited successfully")
    onClose()
  }

  const formData = useWatch({ control })

  useEffect(() => {
    clearErrors()
  }, [clearErrors, isOpen])

  if (!genres) {
    return <Loader />
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex w-full px-6 py-4">
          {game && (
            <MotionButton variant="text" onClick={resetFields}>
              Reset
            </MotionButton>
          )}
          <MotionButton flex onClick={handleSubmit(onSubmit)} disabled={!isValid}>
            Edit Game
          </MotionButton>
        </div>
      }
    >
      <Form control={control} className="mb-6 flex w-full flex-col gap-4 p-6 xl:flex-row">
        {game?.image && (
          <div className="flex w-full items-center justify-center xl:items-start">
            <Image src={game?.image} alt={game?.title} width={300} className="rounded-md" />
          </div>
        )}
        <div className="flex w-full flex-col gap-4">
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
          <Controller
            name="genres"
            control={control}
            rules={{ required: "Genres are required" }}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-2">
                {genres.map((genre) => (
                  <div key={genre.id}>
                    <Checkbox
                      label={genre.genre}
                      checked={field.value.includes(genre.id)}
                      onChange={() =>
                        field.onChange(
                          field.value.includes(genre.id) ? field.value.filter((id) => id !== genre.id) : [...field.value, genre.id],
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          />
          <div className="flex items-center justify-center pb-6">
            <pre className="bg-secondaryBg text-primary w-md overflow-x-auto rounded-md p-2 text-xs">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      </Form>
    </Modal>
  )
}

export default AddEditGame
