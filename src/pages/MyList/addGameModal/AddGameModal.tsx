import { useEffect, useState } from "react"
import Input from "../../../components/form/input/Input"
import Modal from "../../../components/modal/Modal"
import { handleError } from "../../../utils/errors"
import type { Game } from "../../../types/games"
import MotionButton from "../../../components/motionButton/MotionButton"
import MotionContainer from "../../../components/motionContainer/MotionContainer"
import GameRow from "./GameRow"
import { MAX_SELECTED_GAMES } from "../../../helpers/constants"
import { toast } from "sonner"
import { useGamesQuery } from "../../../api/endpoints/useQuery"
import { ApiError } from "../../../api/apiError"
import { useAddGames } from "../../../api/userGames"
import Loader from "../../../components/loader/Loader"
import Select from "../../../components/form/select/Select"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import Empty from "../../../components/empty/Empty"

type AddGameModalProps = {
  isOpen: boolean
  onClose: () => void
}

const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGames, setSelectedGames] = useState<number[]>([])
  const [disabledRows, setDisabledRows] = useState(false)
  const [listType, setListType] = useState<LIST_TYPE | null>(null)
  const { data: searchResults, isLoading: isLoadingSearchResults } = useGamesQuery({ title: searchQuery, excludeMine: true })
  const { mutateAsync: addGames, isPending } = useAddGames()

  const listTypeOptions = Object.values(LIST_TYPE).map((value) => ({ label: LIST_TYPE_LABEL[value], value }))

  useEffect(() => {
    setDisabledRows(selectedGames.length >= MAX_SELECTED_GAMES)
  }, [selectedGames])

  const handleSelectGames = (game: Game) => {
    setSelectedGames((prev) => (prev.includes(game.id) ? prev.filter((g) => g !== game.id) : [...prev, game.id]))
  }

  const clearSelection = () => {
    setSelectedGames([])
    setSearchQuery("")
    setListType(null)
  }

  const close = () => {
    clearSelection()
    onClose()
  }

  const handleAddGames = async () => {
    if (!listType) return

    try {
      await addGames({ data: { gameIds: selectedGames, category: listType } })
      toast.success(selectedGames.length > 1 ? "Games added" : "Game added")
      clearSelection()
      onClose()
    } catch (error: unknown) {
      // Deliberately no clearSelection or onClose here. On failure the user
      // keeps their selection and can retry, rather than having to find the
      // games again. The old version cleared and toasted success before doing
      // any work, so it reported success unconditionally.
      //
      // A 409 is only reachable from a stale modal, since the picker no longer
      // offers games already in the list — so the message points at the fix.
      const alreadyListed = error instanceof ApiError && error.status === 409

      handleError({
        error,
        userMessage: alreadyListed
          ? "Some of those are already in your list — close and reopen to refresh"
          : "An error occurred while adding games",
        componentName: "AddGameModal",
      })
    }
  }

  const isDisabled = selectedGames.length === 0 || !listType

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <div className="flex w-full flex-col gap-4 px-6 pb-6">
        <Input
          type="text"
          id="gameTitle"
          placeholder="Search for a game..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          clearable
        />
        <MotionContainer type="ease" className="flex max-h-80 min-h-60 w-full flex-col gap-1 overflow-y-auto">
          {searchResults ? (
            searchResults.map((game) => (
              <GameRow
                key={game.id}
                game={game}
                isChecked={selectedGames.includes(game.id)}
                onCheck={() => handleSelectGames(game)}
                disabled={disabledRows && !selectedGames.includes(game.id)}
              />
            ))
          ) : isLoadingSearchResults ? (
            <Loader fullPage />
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
            <MotionButton variant="text" onClick={clearSelection} disabled={selectedGames.length === 0}>
              Clear
            </MotionButton>
            <MotionButton flex onClick={handleAddGames} disabled={isDisabled || isPending} variant="success">
              {selectedGames.length > 1 ? "Add Games" : "Add Game"}
            </MotionButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AddGameModal
