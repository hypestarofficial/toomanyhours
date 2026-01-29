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

type AddGameModalProps = {
  isOpen: boolean
  onClose: () => void
}

const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGames, setSelectedGames] = useState<number[]>([])
  const [disabledRows, setDisabledRows] = useState(false)
  const { data: searchResults } = useGamesQuery({ title: searchQuery })

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
        <div className="flex items-center justify-center gap-2">
          <MotionButton variant="text" onClick={() => setSelectedGames([])} disabled={selectedGames.length === 0}>
            Clear
          </MotionButton>
          <MotionButton flex onClick={handleAddGames} disabled={selectedGames.length === 0}>
            {selectedGames.length > 1 ? "Add Games" : "Add Game"}
          </MotionButton>
        </div>
      </div>
    </Modal>
  )
}

export default AddGameModal
