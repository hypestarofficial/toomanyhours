import MotionCollapse from "../../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../../components/myList/GameContainer"
import type { Game } from "../../../types/games"
import styles from "./ListSection.module.css"

type ListSectionProps = {
  title: string
  defaultOpen?: boolean
  setDefaultOpen?: (open: boolean) => void
  games: Game[]
  onSelectItem: (game: Game) => void
}

const ListSection: React.FC<ListSectionProps> = ({ title, games, onSelectItem, defaultOpen = false, setDefaultOpen }) => (
  <MotionCollapse defaultOpen={defaultOpen} title={title} setDefaultOpen={setDefaultOpen}>
    <div className={styles.gamesGrid}>
      {games.map((game, index) => (
        <GameContainer key={game.id} game={game} index={index} onClick={() => onSelectItem(game)} />
      ))}
    </div>
  </MotionCollapse>
)
export default ListSection
