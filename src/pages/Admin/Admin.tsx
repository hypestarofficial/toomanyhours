import { useState } from "react"
import GameContainer from "../../components/myList/GameContainer"
import Page from "../../components/page/Page"
import type { Game } from "../../types/games"
import styles from "./Admin.module.css"
import Loader from "../../components/loader/Loader"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionButton from "../../components/motionButton/MotionButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import AddEditGame from "./addEditGame/AddEditGame"
import { useAdminGamesQuery, useGenresQuery } from "../../api/endpoints/useQuery"

const Admin: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const { data: games, isLoading } = useAdminGamesQuery()
  const { data: _genres } = useGenresQuery()

  const handleToggleModal = (game?: Game | null) => {
    if (game) {
      setSelectedGame(game)
    } else {
      setSelectedGame(null)
    }
    setIsAddGameOpen(!isAddGameOpen)
  }

  if (isLoading) {
    return <Loader fullPage />
  }

  if (!games) {
    return <div>No games found</div>
  }

  return (
    <Page align="start">
      <MotionContainer className="flex w-full flex-col gap-5">
        <div className="flex gap-2">
          <MotionButton icon={<PlusIcon className="h-5 w-5" />} onClick={() => handleToggleModal()}>
            Add Game
          </MotionButton>
        </div>
        <MotionContainer className="flex h-full w-full flex-col gap-2">
          <div className={styles.gamesList}>
            {games.map((game, index) => (
              <GameContainer key={game.id} game={game} index={index} onClick={() => handleToggleModal(game)} />
            ))}
          </div>
        </MotionContainer>
      </MotionContainer>

      {/* Add/Edit Game Modal */}
      <AddEditGame isOpen={isAddGameOpen || !!selectedGame} onClose={() => handleToggleModal()} game={selectedGame} />
    </Page>
  )
}

export default Admin
