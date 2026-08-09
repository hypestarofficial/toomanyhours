import { useMemo, useState } from "react"
import Input from "../../../components/form/input/Input"
import Modal from "../../../components/modal/Modal"
import { handleError } from "../../../utils/errors"
import MotionButton from "../../../components/motionButton/MotionButton"
import MotionContainer from "../../../components/motionContainer/MotionContainer"
import GameRow from "./GameRow"
import { toast } from "sonner"
import { ApiError } from "../../../api/apiError"
import { useAddGames } from "../../../api/userGames"
import Loader from "../../../components/loader/Loader"
import Select from "../../../components/form/select/Select"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import Empty from "../../../components/empty/Empty"
import useAuthStore from "../../../store/useAuthStore"
import { useSearchGames } from "../../../api/generated/games/games"
import { useGetMeGames } from "../../../api/generated/user-games/user-games"
import { ownedIgdbIds, rowState } from "./rows"
import { useDebouncedValue } from "../../../hooks/useDebouncedValue"

// The API answers 400 below two characters, and one character matches most of
// IGDB anyway.
const SEARCH_MIN_CHARS = 2
const SEARCH_DEBOUNCE_MS = 350
const SEARCH_LIMIT = 20

type AddGameModalProps = {
  isOpen: boolean
  onClose: () => void
}

const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIgdbId, setSelectedIgdbId] = useState<number | null>(null)
  const [listType, setListType] = useState<LIST_TYPE | null>(null)

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

  const { mutateAsync: addGames, isPending } = useAddGames()

  const listTypeOptions = Object.values(LIST_TYPE).map((value) => ({ label: LIST_TYPE_LABEL[value], value }))

  // Selecting is single: picking another game replaces the choice rather than
  // adding to a set. Clicking the chosen row again clears it.
  const select = (igdbId: number) => setSelectedIgdbId((prev) => (prev === igdbId ? null : igdbId))

  const clearSelection = () => {
    setSelectedIgdbId(null)
    setSearchQuery("")
    setListType(null)
  }

  const close = () => {
    clearSelection()
    onClose()
  }

  const handleAddGames = async () => {
    if (!listType || selectedIgdbId === null) return

    try {
      // igdbIds, not gameIds: the server imports anything the catalog has not
      // seen before creating the list entry.
      await addGames({ data: { igdbIds: [selectedIgdbId], category: listType } })
      toast.success("Game added")
      clearSelection()
      onClose()
    } catch (error: unknown) {
      // Deliberately no clearSelection or onClose here. On failure the user
      // keeps their selection and can retry, rather than having to find the
      // game again.
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

  const isDisabled = selectedIgdbId === null || !listType

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <div className="flex w-full flex-col gap-4 px-6 pb-6">
        <Input
          type="text"
          id="gameTitle"
          placeholder="Search IGDB for a game..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          clearable
        />
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
                state={rowState(game.igdbId, owned, selectedIgdbId)}
                onCheck={() => select(game.igdbId)}
              />
            ))
          ) : (
            <Empty message="No games found" />
          )}
        </MotionContainer>
        <div className="flex flex-col gap-2">
          <Select
            options={listTypeOptions}
            value={listType}
            onChange={(value) => setListType(value as LIST_TYPE)}
            placeholder="Select a list type"
          />
          <div className="flex items-center justify-center gap-2">
            <MotionButton variant="text" onClick={clearSelection} disabled={selectedIgdbId === null}>
              Clear
            </MotionButton>
            <MotionButton flex onClick={handleAddGames} disabled={isDisabled || isPending} variant="success">
              Add Game
            </MotionButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AddGameModal
