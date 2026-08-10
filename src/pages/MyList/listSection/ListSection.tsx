import { useDroppable } from "@dnd-kit/core"
import Empty from "../../../components/empty/Empty"
import MotionCollapse from "../../../components/motionCollapse/MotionCollapse"
import GameContainer from "../../../components/myList/GameContainer"
import type { UserGame } from "../../../api/generated/models"
import type { LIST_TYPE } from "../../../helpers/enums"
import { LIST_LAYOUT } from "../../../store/useUserSettingsAuth"
import { cn } from "../../../utils/cn"
import { addOnsOf } from "../gameCard/dlcRows"
import styles from "./ListSection.module.css"

type ListSectionProps = {
  title: string
  category: LIST_TYPE
  open: boolean
  onOpenChange: (open: boolean) => void
  layout: LIST_LAYOUT
  isFiltering?: boolean
  entries?: UserGame[]
  /**
   * Every entry in the list, not just this section's. A game's add-ons can sit
   * in any category — a DLC you want to play under a game you finished — so
   * the section it belongs to cannot answer what a card owns.
   */
  allEntries?: UserGame[]
  onSelectItem: (entry: UserGame) => void
  isLoading?: boolean
  // Someone else's list: no dropping, no dragging. Clicking still opens a
  // detail, which is the whole point of a shared list.
  readOnly?: boolean
}

// Titles rather than entries, because GameContainer is presentational and
// should not learn what a list entry is to render a tooltip.
const addOnTitlesFor = (entry: UserGame, allEntries: UserGame[]): string[] =>
  addOnsOf(entry, allEntries)
    .map((addOn) => addOn.game?.title)
    .filter((title): title is string => !!title)

const ListSection: React.FC<ListSectionProps> = ({
  title,
  category,
  entries,
  allEntries,
  onSelectItem,
  open,
  onOpenChange,
  layout,
  isFiltering,
  isLoading,
  readOnly,
}) => {
  // disabled rather than skipping the hook: hooks cannot be conditional, and a
  // droppable nobody can drag to is inert anyway.
  const { setNodeRef, isOver } = useDroppable({ id: category, disabled: readOnly })

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
                // The API trims a blank review to null, so "has one" is a
                // plain truthiness check rather than a length test.
                hasReview={!!entry.review}
                addOnTitles={addOnTitlesFor(entry, allEntries ?? [])}
                layout={layout}
                index={index}
                onClick={() => onSelectItem(entry)}
                drag={readOnly ? undefined : { id: entry.id, gameId: entry.gameId, category: entry.category }}
              />
            ))}
          </div>
        ) : (
          <Empty message={isFiltering ? "No matches" : "Nothing here yet"} fullPage />
        )}
      </MotionCollapse>
    </div>
  )
}

export default ListSection
