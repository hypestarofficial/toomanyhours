import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import Input from "../../../components/form/input/Input"
import Modal from "../../../components/modal/Modal"
import { handleError } from "../../../utils/errors"
import MotionButton from "../../../components/motionButton/MotionButton"
import MotionContainer from "../../../components/motionContainer/MotionContainer"
import GameRow from "./GameRow"
import { toast } from "sonner"
import { ApiError } from "../../../api/apiError"
import { useAddGame } from "../../../api/userGames"
import Loader from "../../../components/loader/Loader"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import Empty from "../../../components/empty/Empty"
import useAuthStore from "../../../store/useAuthStore"
import { useSearchGames } from "../../../api/generated/games/games"
import { useGetMeGames } from "../../../api/generated/user-games/user-games"
import type { IGDBGame } from "../../../api/generated/models"
import { ownedIgdbIds, rowState } from "./rows"
import { addGamePayload } from "./payload"
import { useDebouncedValue } from "../../../hooks/useDebouncedValue"
import RatingFields from "../RatingFields"
import type { RatingFormValues } from "../RatingFields"
import { Image } from "@heroui/image"
import placeholderImage from "../../../assets/images/placeholder.webp"

// The API answers 400 below two characters, and one character matches most of
// IGDB anyway.
const SEARCH_MIN_CHARS = 2
const SEARCH_DEBOUNCE_MS = 350
const SEARCH_LIMIT = 20

// Adding is two steps: find one game, then say what it is to you. The second
// step is where a rating and a review can be written, which a batch add could
// never carry — "rating: 8" against five games means nothing.
type Step = "search" | "details"

type AddGameModalProps = {
  isOpen: boolean
  onClose: () => void
}

const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>("search")
  const [searchQuery, setSearchQuery] = useState("")
  // The whole game, not just its id: step 2 shows the cover, title and year,
  // because three IGDB entries share the title "Grand Theft Auto V" and those
  // are what separate them.
  const [selected, setSelected] = useState<IGDBGame | null>(null)
  const [category, setCategory] = useState<LIST_TYPE | null>(null)

  const { jwtToken } = useAuthStore()
  const trimmed = searchQuery.trim()
  const debouncedQuery = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS)

  // Two different questions, deliberately asked of two different values.
  // showPrompt reads what the user has typed *now*, so the "type more" hint
  // disappears the moment they reach two characters instead of lingering for
  // the debounce window. canSearch reads the debounced value, because that is
  // what the request is made from.
  const showPrompt = trimmed.length < SEARCH_MIN_CHARS
  const canSearch = debouncedQuery.length >= SEARCH_MIN_CHARS
  // A search the user has asked for but that has not been issued yet.
  const isPendingDebounce = debouncedQuery !== trimmed

  const { data: results, isFetching } = useSearchGames(
    { q: debouncedQuery, limit: SEARCH_LIMIT },
    { query: { enabled: !!jwtToken && canSearch } },
  )

  // Already loaded for the list behind this modal, so knowing what is owned
  // costs nothing.
  const { data: entries } = useGetMeGames({ query: { enabled: !!jwtToken } })
  const owned = useMemo(() => ownedIgdbIds(entries), [entries])

  const { mutateAsync: addGame, isPending } = useAddGame()

  const {
    control,
    handleSubmit,
    reset: resetFields,
  } = useForm<RatingFormValues>({
    defaultValues: { rating: 0, review: "" },
  })

  // Selecting is single: picking another game replaces the choice rather than
  // adding to a set. Clicking the chosen row again clears it.
  const select = (game: IGDBGame) => setSelected((prev) => (prev?.igdbId === game.igdbId ? null : game))

  const reset = () => {
    setStep("search")
    setSearchQuery("")
    setSelected(null)
    setCategory(null)
    resetFields()
  }

  const close = () => {
    reset()
    onClose()
  }

  // Back keeps the search text and the selection, so correcting a mispick
  // costs nothing. Only the category and the fields are dropped, because they
  // were about the game you are no longer adding.
  const back = () => {
    setStep("search")
    setCategory(null)
    resetFields()
  }

  const scored = category === LIST_TYPE.FINISHED

  const onSubmit = async (data: RatingFormValues) => {
    if (!selected || !category) return

    try {
      // The omission rules live in addGamePayload, which is pure and tested:
      // sending the form's 0 for "unrated" would 400, and that is a mistake
      // no component test would catch.
      await addGame({ data: addGamePayload(selected.igdbId, category, data) })
      toast.success(`${selected.title} added`)
      close()
    } catch (error: unknown) {
      // Deliberately no reset or close here. On failure the user keeps their
      // selection and can retry, rather than having to find the game again.
      //
      // A 409 is only reachable from a stale modal, since owned games are
      // shown disabled — so the message points at the fix.
      const alreadyListed = error instanceof ApiError && error.status === 409

      handleError({
        error,
        userMessage: alreadyListed
          ? "That game is already in your list — close and reopen to refresh"
          : "An error occurred while adding the game",
        componentName: "AddGameModal",
      })
    }
  }

  const year = selected?.releaseDate?.slice(0, 4)

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <div className="flex w-full flex-col gap-4 px-6 pb-6">
        {step === "search" ? (
          <>
            <Input
              type="text"
              id="gameTitle"
              placeholder="Search IGDB for a game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              clearable
            />
            {/* min-h matches the details step so the modal does not jump
                between them. */}
            <MotionContainer type="ease" className="flex max-h-80 min-h-60 w-full flex-col gap-1 overflow-y-auto">
              {showPrompt ? (
                <Empty message={`Type at least ${SEARCH_MIN_CHARS} characters`} />
              ) : isFetching || isPendingDebounce ? (
                <Loader fullPage />
              ) : results && results.length > 0 ? (
                results.map((game) => (
                  <GameRow
                    key={game.igdbId}
                    game={game}
                    state={rowState(game.igdbId, owned, selected?.igdbId ?? null)}
                    onCheck={() => select(game)}
                  />
                ))
              ) : (
                <Empty message="No games found" />
              )}
            </MotionContainer>
            <MotionButton flex variant="success" onClick={() => setStep("details")} disabled={!selected}>
              Next
            </MotionButton>
          </>
        ) : (
          <MotionContainer type="ease" className="flex min-h-60 w-full flex-col gap-4">
            {/* Confirms the pick before it is committed. */}
            <div className="flex items-center gap-3">
              <Image
                src={selected?.image || placeholderImage}
                alt={selected?.title}
                className="pointer-events-none h-16 w-12 shrink-0 rounded object-cover"
              />
              <div className="flex min-w-0 flex-col">
                <span className="line-clamp-2 font-semibold">{selected?.title}</span>
                <span className="text-xs opacity-60">{year ?? "Unreleased"}</span>
              </div>
            </div>

            {/* Three buttons rather than a dropdown: choosing finished reveals
                a form, and a reveal triggered from inside a collapsed control
                reads as the modal growing on its own. */}
            <div className="flex w-full flex-wrap gap-2">
              {Object.values(LIST_TYPE).map((value) => (
                <MotionButton key={value} flex variant={category === value ? "active" : "default"} onClick={() => setCategory(value)}>
                  {LIST_TYPE_LABEL[value]}
                </MotionButton>
              ))}
            </div>

            {/* Both fields are optional; Add stays enabled with neither. */}
            {scored && <RatingFields control={control} />}

            <div className="flex w-full gap-2">
              <MotionButton onClick={back} disabled={isPending}>
                Back
              </MotionButton>
              <MotionButton flex variant="success" onClick={handleSubmit(onSubmit)} disabled={!category || isPending}>
                Add Game
              </MotionButton>
            </div>
          </MotionContainer>
        )}
      </div>
    </Modal>
  )
}

export default AddGameModal
