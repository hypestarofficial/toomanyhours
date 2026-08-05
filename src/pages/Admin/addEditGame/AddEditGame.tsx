import Input from "../../../components/form/input/Input"
import Modal from "../../../components/modal/Modal"
import type { Game } from "../../../types/games"
import MotionButton from "../../../components/motionButton/MotionButton"
import { toast } from "sonner"
import { Controller, Form, useForm, useWatch } from "react-hook-form"
import { useCallback, useEffect, useState } from "react"
import { Image } from "@heroui/image"
import dayjs from "dayjs"
import Checkbox from "../../../components/form/checkbox/Checkbox"
import { getGetAdminGamesQueryKey, useCreateGame, useDeleteGame, useUpdateGame } from "../../../api/generated/admin/admin"
import { useGetGenres } from "../../../api/generated/genres/genres"
import Loader from "../../../components/loader/Loader"
import { handleError } from "../../../utils/errors"
import { useQueryClient } from "@tanstack/react-query"
import Dialog from "../../../components/dialog/Dialog"

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
  genreIds: number[]
}

const AddEditGame: React.FC<AddEditGameProps> = ({ game, isOpen, onClose }) => {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: genres } = useGetGenres()
  // <Error> because the mutator throws a real Error; Orval otherwise
  // types the error as the spec's ErrorResponse, which never reaches here.
  const { mutate: createGame } = useCreateGame<Error>()
  const { mutate: updateGame } = useUpdateGame<Error>()
  const { mutate: deleteGame } = useDeleteGame<Error>()

  // The generated query key is ['/admin/games', ...params], not the old
  // ['admin-games']. Invalidating the stale string would silently do nothing
  // and the list would not refresh after a save.
  const adminGamesKey = getGetAdminGamesQueryKey()

  const {
    control,
    clearErrors,
    handleSubmit,
    formState: { isValid, isDirty },
    reset,
  } = useForm<AddEditGameForm>({
    defaultValues: {
      id: 0,
      title: "",
      image: "",
      releaseDate: dayjs().format("YYYY-MM-DD"),
      genreIds: [],
    },
    mode: "onChange",
  })

  const resetFields = useCallback(() => {
    if (!game) return
    reset({
      id: game.id,
      title: game.title,
      image: game.image,
      releaseDate: dayjs(game.releaseDate).format("YYYY-MM-DD"),
      genreIds: game.genres?.map((genre) => genre.id) ?? [],
    })
  }, [game, reset])

  useEffect(() => {
    if (isOpen && game) {
      resetFields()
    } else {
      reset({
        id: 0,
        title: "",
        image: "",
        releaseDate: dayjs().format("YYYY-MM-DD"),
        genreIds: [],
      })
    }
  }, [game, isOpen, resetFields, reset])

  const onSubmit = async (data: AddEditGameForm) => {
    if (game) {
      // Edit game
      updateGame(
        {
          id: game.id,
          data: {
            title: data.title,
            image: data.image,
            releaseDate: dayjs(data.releaseDate).toISOString(),
            genreIds: data.genreIds,
          },
        },
        {
          onSuccess: () => {
            toast.success("Game updated successfully!")
            queryClient.invalidateQueries({ queryKey: adminGamesKey })
            onClose()
          },
          onError: (error: Error) => {
            handleError({ error, userMessage: "An error occurred while updating the game", componentName: "AddEditGame" })
          },
        },
      )
    } else {
      // Add game
      const payload = {
        id: data.id,
        title: data.title,
        image: data.image,
        releaseDate: dayjs(data.releaseDate).toISOString(),
        genreIds: data.genreIds,
      }
      createGame(
        { data: payload },
        {
          onSuccess: () => {
            toast.success("Game saved successfully!")
            queryClient.invalidateQueries({ queryKey: adminGamesKey })
            onClose()
          },
          onError: (error: Error) => {
            handleError({ error, userMessage: "An error occurred while adding the game", componentName: "AddEditGame" })
          },
        },
      )
    }
  }

  const onDelete = async () => {
    if (!game || !game.id) {
      handleError({ error: new Error("Game ID is required"), userMessage: "Game id seems to be missing", componentName: "AddEditGame" })
      return
    }

    try {
      deleteGame(
        { id: game.id },
        {
          onSuccess: () => {
            toast.success("Game deleted successfully!")
            queryClient.invalidateQueries({ queryKey: adminGamesKey })
            setIsDialogOpen(false)
            setTimeout(() => {
              onClose()
            }, 250)
          },
          onError: (error: Error) => {
            handleError({ error, userMessage: "An error occurred while deleting the game", componentName: "AddEditGame" })
          },
        },
      )
    } catch (error: unknown) {
      handleError({ error, userMessage: "An error occurred while deleting the game", componentName: "AddEditGame" })
    }
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
      size="xl"
      footer={
        <div className="flex w-full gap-2 px-6 py-4">
          {game && (
            <div className="flex gap-2">
              <MotionButton variant="text" onClick={resetFields}>
                Reset
              </MotionButton>
              <MotionButton variant="error" flex onClick={() => setIsDialogOpen(true)}>
                Delete
              </MotionButton>
            </div>
          )}
          <MotionButton variant="success" flex onClick={handleSubmit(onSubmit)} disabled={game ? !isValid || !isDirty : !isValid}>
            {game ? "Edit Game" : "Add Game"}
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
            // rules={{ required: "Image is required" }}
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
            name="genreIds"
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

      <Dialog
        isOpen={isDialogOpen}
        type="warning"
        onConfirm={onDelete}
        onClose={() => setIsDialogOpen(false)}
        children={
          <p>
            Are you sure you want to delete <b>{game?.title}</b>?
          </p>
        }
      />
    </Modal>
  )
}

export default AddEditGame
