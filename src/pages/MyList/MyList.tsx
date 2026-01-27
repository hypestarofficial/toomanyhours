import { useEffect, useState } from "react"
import MotionCollapse from "../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../components/myList/GameContainer"
import Page from "../../components/page/Page"
import type { Game } from "../../types/games"
import { handleError } from "../../utils/errors"
import styles from "./MyList.module.css"
import Loader from "../../components/loader/Loader"
import MotionContainer from "../../components/motionContainer/MotionContainer"

const MyList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const headers = new Headers()
      headers.append("Content-Type", "application/json")

      const requestOptions = {
        method: "GET",
        headers,
      }

      fetch(`/api/games`, requestOptions)
        .then((response) => response.json())
        .then((data) => setGames(data))
        .catch((error: unknown) => handleError(error, "MyList"))
        .finally(() => setIsLoading(false))
    } catch (error: unknown) {
      handleError(error, "MyList")
    }
  }, [])

  if (isLoading) {
    return <Loader fullPage />
  }

  return (
    <Page>
      <MotionContainer className="flex h-full w-full flex-col gap-2">
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
    </Page>
  )
}

export default MyList
