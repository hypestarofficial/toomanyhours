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
import MultiSelect from "../../components/form/multiSelect/MultiSelect"
import Empty from "../../components/empty/Empty"
import useUserSettingsAuthStore from "../../store/useUserSettingsAuth"

const Admin: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const { filterGenres, setFilterGenres } = useUserSettingsAuthStore()
  const { data: games, isLoading: isLoadingGames } = useAdminGamesQuery({ genreIDs: filterGenres })
  const { data: genres } = useGenresQuery()

  const multiSelectOptions = genres?.map((genre) => ({ label: genre.genre, value: genre.id })) ?? []

  const handleToggleModal = (game?: Game | null) => {
    if (game) {
      setSelectedGame(game)
    } else {
      setSelectedGame(null)
    }
    setIsAddGameOpen(!isAddGameOpen)
  }

  return (
    <Page align="start">
      <MotionContainer className="flex w-full flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <MotionButton icon={<PlusIcon className="h-5 w-5" />} onClick={() => handleToggleModal()}>
            Add game to DB
          </MotionButton>
          <div className="flex gap-2">
            <MultiSelect options={multiSelectOptions} value={filterGenres} onChange={setFilterGenres} placeholder="Filter by genres" />
          </div>
        </div>
        <MotionContainer className="flex h-full w-full flex-col gap-2">
          {games && games.length > 0 ? (
            <div className={styles.gamesList}>
              {games.map((game, index) => (
                <GameContainer key={game.id} game={game} index={index} onClick={() => handleToggleModal(game)} />
              ))}
            </div>
          ) : isLoadingGames ? (
            <Loader fullPage />
          ) : (
            <Empty message="No games found" bold />
          )}
        </MotionContainer>
      </MotionContainer>

      {/* Add/Edit Game Modal */}
      <AddEditGame isOpen={isAddGameOpen || !!selectedGame} onClose={() => handleToggleModal()} game={selectedGame} />
    </Page>
  )
}

export default Admin
