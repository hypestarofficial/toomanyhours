import { useState } from "react"
import Page from "../../components/page/Page"
import Loader from "../../components/loader/Loader"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionButton from "../../components/motionButton/MotionButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import AddGameModal from "./addGameModal/AddGameModal"
import { useGamesQuery } from "../../api/endpoints/useQuery"
import type { Game } from "../../types/games"
import GameCard from "./gameCard/GameCard"
import ListSection from "./listSection/ListSection"

const MyList: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const { data: games, isLoading } = useGamesQuery()

  if (isLoading) {
    return <Loader fullPage />
  }

  if (!games) {
    return <div>No games found</div>
  }

  return (
    <Page align="start">
      <MotionContainer type="ease" className="fixed bottom-6 left-6">
        <MotionButton
          variant="success"
          className="rounded-full"
          icon={<PlusIcon className="h-5 w-5" />}
          onClick={() => setIsAddGameOpen(true)}
        >
          Add Game
        </MotionButton>
      </MotionContainer>
      <MotionContainer className="flex w-full flex-col gap-2 pb-10">
        <ListSection title="finished" games={games} onSelectItem={setSelectedGame} defaultOpen={true} />
        <ListSection title="currently playing" games={games} onSelectItem={setSelectedGame} />
        <ListSection title="want to play" games={games} onSelectItem={setSelectedGame} />
      </MotionContainer>

      {/* Add Game Modal */}
      <AddGameModal isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />

      {/* Game Details Modal */}
      <GameCard game={selectedGame} onClose={() => setSelectedGame(null)} />
    </Page>
  )
}

export default MyList
