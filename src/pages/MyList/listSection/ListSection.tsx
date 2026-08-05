import Empty from "../../../components/empty/Empty"
import MotionCollapse from "../../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../../components/myList/GameContainer"
import type { Game } from "../../../types/games"
import styles from "./ListSection.module.css"

type ListSectionProps = {
  title: string
  defaultOpen?: boolean
  setDefaultOpen?: (open: boolean) => void
  games?: Game[]
  onSelectItem: (game: Game) => void
  isLoading?: boolean
}

const ListSection: React.FC<ListSectionProps> = ({ title, games, onSelectItem, defaultOpen = false, setDefaultOpen, isLoading }) => (
  <MotionCollapse defaultOpen={defaultOpen} title={title} setDefaultOpen={setDefaultOpen} isLoading={isLoading}>
    {games && games.length > 0 ? (
      <div className={styles.gamesGrid}>
        {games.map((game, index) => (
          <GameContainer key={game.id} game={game} index={index} onClick={() => onSelectItem(game)} />
        ))}
      </div>
    ) : (
      <Empty message="No games found" fullPage />
    )}
  </MotionCollapse>
)
export default ListSection
