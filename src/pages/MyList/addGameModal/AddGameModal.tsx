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
import Loader from "../../../components/loader/Loader"
import Select from "../../../components/form/select/Select"
import { LIST_TYPE } from "../../../helpers/enums"

type AddGameModalProps = {
  isOpen: boolean
  onClose: () => void
}

const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGames, setSelectedGames] = useState<number[]>([])
  const [disabledRows, setDisabledRows] = useState(false)
  const [listType, setListType] = useState<LIST_TYPE | null>(null)
  const { data: searchResults } = useGamesQuery({ title: searchQuery })

  const listTypeOptions = [
    { label: "Finished", value: LIST_TYPE.FINISHED },
    { label: "Currently playing", value: LIST_TYPE.CURRENTLY_PLAYING },
    { label: "Want to play", value: LIST_TYPE.WANT_TO_PLAY },
  ]

  useEffect(() => {
    setDisabledRows(selectedGames.length >= MAX_SELECTED_GAMES)
  }, [selectedGames])

  const handleSelectGames = (game: Game) => {
    setSelectedGames((prev) => (prev.includes(game.id) ? prev.filter((g) => g !== game.id) : [...prev, game.id]))
  }

  const handleAddGames = () => {
    try {
      setSelectedGames([])
      setSearchQuery("")
      toast.success("Games added successfully")
    } catch (error: unknown) {
      handleError(error, "AddGameModal")
    } finally {
      onClose()
    }
  }

  const isDisabled = selectedGames.length === 0 || !listType

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex w-full flex-col gap-4">
        <Input
          type="text"
          id="gameTitle"
          placeholder="Search for a game..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          clearable
        />
        <MotionContainer type="ease" className="flex h-64 w-full flex-col gap-1 overflow-y-auto">
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
          ) : (
            <Loader fullPage />
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
            <MotionButton variant="text" onClick={() => setSelectedGames([])} disabled={selectedGames.length === 0}>
              Clear
            </MotionButton>
            <MotionButton flex onClick={handleAddGames} disabled={isDisabled}>
              {selectedGames.length > 1 ? "Add Games" : "Add Game"}
            </MotionButton>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AddGameModal
