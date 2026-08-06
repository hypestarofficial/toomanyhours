import Empty from "../../../components/empty/Empty"
import MotionCollapse from "../../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../../components/myList/GameContainer"
import type { UserGame } from "../../../api/generated/models"
import styles from "./ListSection.module.css"

type ListSectionProps = {
  title: string
  defaultOpen?: boolean
  setDefaultOpen?: (open: boolean) => void
  entries?: UserGame[]
  onSelectItem: (entry: UserGame) => void
  isLoading?: boolean
}

const ListSection: React.FC<ListSectionProps> = ({ title, entries, onSelectItem, defaultOpen = false, setDefaultOpen, isLoading }) => (
  <MotionCollapse defaultOpen={defaultOpen} title={title} setDefaultOpen={setDefaultOpen} isLoading={isLoading}>
    {entries && entries.length > 0 ? (
      <div className={styles.gamesGrid}>
        {/* Keyed by the entry, not the game: the entry is what is being rendered,
            and its id is the stable identity across a category move. */}
        {entries.map((entry, index) => (
          <GameContainer
            key={entry.id}
            title={entry.game?.title}
            image={entry.game?.image}
            index={index}
            onClick={() => onSelectItem(entry)}
          />
        ))}
      </div>
    ) : (
      <Empty message="Nothing here yet" fullPage />
    )}
  </MotionCollapse>
)
export default ListSection
