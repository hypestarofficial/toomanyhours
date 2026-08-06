import { useState } from "react"
import Page from "../../components/page/Page"
import Loader from "../../components/loader/Loader"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import MotionButton from "../../components/motionButton/MotionButton"
import { PlusIcon } from "@heroicons/react/24/outline"
import AddGameModal from "./addGameModal/AddGameModal"
import GameCard from "./gameCard/GameCard"
import ListSection from "./listSection/ListSection"
import useUserSettingsAuthStore from "../../store/useUserSettingsAuth"
import useAuthStore from "../../store/useAuthStore"
import { useGetMeGames } from "../../api/generated/user-games/user-games"
import type { UserGame } from "../../api/generated/models"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../helpers/enums"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import GameContainer from "../../components/myList/GameContainer"
import { useMoveEntry } from "../../api/userGames"
import { toast } from "sonner"

const MyList: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<UserGame | null>(null)
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const { defaultListConfig, setDefaultListConfig } = useUserSettingsAuthStore()
  const { jwtToken } = useAuthStore()

  // Generated hooks need `enabled` passed explicitly, or they fire before a
  // token exists and 401 on boot.
  const { data: entries, isLoading } = useGetMeGames({ query: { enabled: !!jwtToken } })

  const byCategory = (category: LIST_TYPE) => entries?.filter((entry) => entry.category === category) ?? []

  const { mutate: moveEntry } = useMoveEntry()

  // Without a distance constraint every click counts as a drag and the detail
  // modal stops opening.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  // Held so the drag overlay knows which card to render under the cursor.
  const [draggedEntry, setDraggedEntry] = useState<UserGame | null>(null)

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDraggedEntry(entries?.find((entry) => entry.id === active.id) ?? null)
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const moved = draggedEntry
    setDraggedEntry(null)

    if (!over) return

    const category = over.id as LIST_TYPE
    const gameId = active.data.current?.gameId as number | undefined
    const from = active.data.current?.category as LIST_TYPE | undefined

    // Dropping a game back where it started is not a move; sending it would
    // cost a request and a refetch to change nothing.
    if (!gameId || from === category) return

    moveEntry(
      { gameId, data: { category } },
      {
        // Names the destination because the card may have landed in a
        // collapsed section, where the move is otherwise invisible.
        onSuccess: () => toast.success(`${moved?.game?.title ?? "Game"} → ${LIST_TYPE_LABEL[category]}`),
        onError: () => toast.error("Could not move that game"),
      },
    )
  }

  if (isLoading) {
    return <Loader fullPage />
  }

  // No early return for an empty list: having no games is a valid state that
  // should render three empty sections, not an error message.
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
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setDraggedEntry(null)}>
        <MotionContainer className="flex w-full flex-col gap-2 pb-10">
          <ListSection
            title="finished"
            category={LIST_TYPE.FINISHED}
            entries={byCategory(LIST_TYPE.FINISHED)}
            onSelectItem={setSelectedEntry}
            open={defaultListConfig.finished}
            onOpenChange={(next) => setDefaultListConfig({ ...defaultListConfig, finished: next })}
          />
          <ListSection
            title="currently playing"
            category={LIST_TYPE.CURRENTLY_PLAYING}
            entries={byCategory(LIST_TYPE.CURRENTLY_PLAYING)}
            onSelectItem={setSelectedEntry}
            open={defaultListConfig.currentlyPlaying}
            onOpenChange={(next) => setDefaultListConfig({ ...defaultListConfig, currentlyPlaying: next })}
          />
          <ListSection
            title="want to play"
            category={LIST_TYPE.WANT_TO_PLAY}
            entries={byCategory(LIST_TYPE.WANT_TO_PLAY)}
            onSelectItem={setSelectedEntry}
            open={defaultListConfig.wantToPlay}
            onOpenChange={(next) => setDefaultListConfig({ ...defaultListConfig, wantToPlay: next })}
          />
        </MotionContainer>

        {/* Follows the cursor while dragging. Without it the only cue is the
            origin card fading, which is easy to miss and says nothing about
            what you are carrying. */}
        <DragOverlay dropAnimation={null}>
          {draggedEntry ? (
            <div className="w-36">
              <GameContainer title={draggedEntry.game?.title} image={draggedEntry.game?.image} index={0} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Game Modal */}
      <AddGameModal isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />

      {/* Game Details Modal */}
      <GameCard entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </Page>
  )
}

export default MyList
