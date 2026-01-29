import { useState } from "react"
import MotionCollapse from "../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../components/myList/GameContainer"
import Page from "../../components/page/Page"
import styles from "./MyList.module.css"
import Loader from "../../components/loader/Loader"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionButton from "../../components/motionButton/MotionButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import AddGameModal from "./addGameModal/AddGameModal"
import { useGamesQuery } from "../../api/endpoints/useQuery"

const MyList: React.FC = () => {
  // const [games, setGames] = useState<Game[]>([])
  // const [isLoading, setIsLoading] = useState(true)
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
      <MotionContainer className="flex w-full flex-col gap-2">
        <div className="flex gap-2">
          <MotionButton icon={<PlusIcon className="h-5 w-5" />} onClick={() => setIsAddGameOpen(true)}>
            Add Game
          </MotionButton>
        </div>
        <MotionCollapse defaultOpen={true} title="finished">
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <GameContainer key={game.id} game={game} index={index} />
            ))}
          </div>
        </MotionCollapse>
        <MotionCollapse defaultOpen={false} title="currently playing">
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <GameContainer key={game.id} game={game} index={index} />
            ))}
          </div>
        </MotionCollapse>
        <MotionCollapse defaultOpen={false} title="want to play">
          <div className={styles.gamesGrid}>
            {games.map((game, index) => (
              <GameContainer key={game.id} game={game} index={index} />
            ))}
          </div>
        </MotionCollapse>
      </MotionContainer>

      {/* Add Game Modal */}
      <AddGameModal isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />
    </Page>
  )
}

export default MyList
