import { useDroppable } from "@dnd-kit/core"
import Empty from "../../../components/empty/Empty"
import MotionCollapse from "../../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../../components/myList/GameContainer"
import type { UserGame } from "../../../api/generated/models"
import type { LIST_TYPE } from "../../../helpers/enums"
import { LIST_LAYOUT } from "../../../store/useUserSettingsAuth"
import { cn } from "../../../utils/cn"
import styles from "./ListSection.module.css"

type ListSectionProps = {
  title: string
  category: LIST_TYPE
  open: boolean
  onOpenChange: (open: boolean) => void
  layout: LIST_LAYOUT
  entries?: UserGame[]
  onSelectItem: (entry: UserGame) => void
  isLoading?: boolean
}

const ListSection: React.FC<ListSectionProps> = ({ title, category, entries, onSelectItem, open, onOpenChange, layout, isLoading }) => {
  const { setNodeRef, isOver } = useDroppable({ id: category })

  return (
    // The drop ref sits on this wrapper rather than inside MotionCollapse's
    // children, so a collapsed section still accepts a drop on its header.
    // Inside the collapsible content, dropping onto a closed section would be
    // impossible.
    <div ref={setNodeRef} className={cn("rounded-xl transition-colors", isOver && "bg-highlight/10 ring-highlight ring-2")}>
      <MotionCollapse title={title} open={open} onOpenChange={onOpenChange} isLoading={isLoading}>
        {entries && entries.length > 0 ? (
          <div className={layout === LIST_LAYOUT.ROWS ? styles.gamesRows : styles.gamesGrid}>
            {/* Keyed by the entry, not the game: the entry is what is being
                rendered, and its id is the stable identity across a move. */}
            {entries.map((entry, index) => (
              <GameContainer
                key={entry.id}
                title={entry.game?.title}
                image={entry.game?.image}
                rating={entry.rating}
                layout={layout}
                index={index}
                onClick={() => onSelectItem(entry)}
                drag={{ id: entry.id, gameId: entry.gameId, category: entry.category }}
              />
            ))}
          </div>
        ) : (
          <Empty message="Nothing here yet" fullPage />
        )}
      </MotionCollapse>
    </div>
  )
}

export default ListSection
