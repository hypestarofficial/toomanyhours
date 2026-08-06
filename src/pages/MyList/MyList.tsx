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
import { LIST_TYPE } from "../../helpers/enums"
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
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

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return

    const category = over.id as LIST_TYPE
    const gameId = active.data.current?.gameId as number | undefined
    const from = active.data.current?.category as LIST_TYPE | undefined

    // Dropping a game back where it started is not a move; sending it would
    // cost a request and a refetch to change nothing.
    if (!gameId || from === category) return

    moveEntry({ gameId, data: { category } }, { onError: () => toast.error("Could not move that game") })
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
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <MotionContainer className="flex w-full flex-col gap-2 pb-10">
          <ListSection
            title="finished"
            category={LIST_TYPE.FINISHED}
            entries={byCategory(LIST_TYPE.FINISHED)}
            onSelectItem={setSelectedEntry}
            defaultOpen={defaultListConfig.finished}
            setDefaultOpen={(open) => setDefaultListConfig({ ...defaultListConfig, finished: open })}
          />
          <ListSection
            title="currently playing"
            category={LIST_TYPE.CURRENTLY_PLAYING}
            entries={byCategory(LIST_TYPE.CURRENTLY_PLAYING)}
            onSelectItem={setSelectedEntry}
            defaultOpen={defaultListConfig.currentlyPlaying}
            setDefaultOpen={(open) => setDefaultListConfig({ ...defaultListConfig, currentlyPlaying: open })}
          />
          <ListSection
            title="want to play"
            category={LIST_TYPE.WANT_TO_PLAY}
            entries={byCategory(LIST_TYPE.WANT_TO_PLAY)}
            onSelectItem={setSelectedEntry}
            defaultOpen={defaultListConfig.wantToPlay}
            setDefaultOpen={(open) => setDefaultListConfig({ ...defaultListConfig, wantToPlay: open })}
          />
        </MotionContainer>
      </DndContext>

      {/* Add Game Modal */}
      <AddGameModal isOpen={isAddGameOpen} onClose={() => setIsAddGameOpen(false)} />

      {/* Game Details Modal */}
      <GameCard entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
    </Page>
  )
}

export default MyList
