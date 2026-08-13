import { useEffect, useMemo, useRef, useState } from "react"
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
import ListToolbar from "../../components/listToolbar/ListToolbar"
import { profileShareUrl } from "../../helpers/shareUrl"
import { matchesFilters } from "../../list/filters"
import { genreOptions } from "../../list/genreOptions"
import { sortEntries } from "../../list/sort"
import { visibleEntries } from "../../list/visibleEntries"

const MyList: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<UserGame | null>(null)
  const [isAddGameOpen, setIsAddGameOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { defaultListConfig, setDefaultListConfig, layout, setLayout, filterGenres, setFilterGenres, sortField, sortDirection, setSort } =
    useUserSettingsAuthStore()
  const { jwtToken, user } = useAuthStore()

  // Generated hooks need `enabled` passed explicitly, or they fire before a
  // token exists and 401 on boot.
  const { data: entries, isLoading } = useGetMeGames({ query: { enabled: !!jwtToken } })

  // Computed here rather than inside the share button, which now serves two
  // pages and must not assume the list it is looking at is yours.
  const shareUrl = profileShareUrl(window.location.origin, user?.username ?? "")
  const isPrivate = user?.visibility === "private"

  const isFiltering = search.trim() !== "" || filterGenres.length > 0

  // The open/closed state from before filtering started, so clearing the
  // filter puts things back. Deliberately not the mid-filter state: a section
  // collapsed during a search was collapsed about the search.
  const preFilterConfig = useRef(defaultListConfig)
  const wasFiltering = useRef(false)

  useEffect(() => {
    // Only on the transition. Without this guard the effect writes to the
    // store on mount, and including defaultListConfig in the deps would fight
    // the user every time they collapsed a section mid-search.
    //
    // Snapshot and restore live in the same effect on purpose. Two effects
    // keyed on the same value work only because React runs them in
    // declaration order — a correctness dependency on line ordering.
    if (isFiltering === wasFiltering.current) return

    if (isFiltering) {
      preFilterConfig.current = defaultListConfig
      // A match can be in a collapsed section, so filtering has to reveal it.
      setDefaultListConfig({ finished: true, currentlyPlaying: true, wantToPlay: true })
    } else {
      setDefaultListConfig(preFilterConfig.current)
    }

    wasFiltering.current = isFiltering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFiltering])

  // The same restore, for the other way a filter can end: navigating away.
  // `search` is component state, so it resets on remount and isFiltering comes
  // back false — the transition effect above never fires, and the store is
  // left holding the all-open state the filter wrote. Both refs, so this can
  // depend only on the store setter, which zustand keeps stable; the cleanup
  // therefore runs on unmount and nowhere else.
  useEffect(
    () => () => {
      if (wasFiltering.current) {
        setDefaultListConfig(preFilterConfig.current)
      }
    },
    [setDefaultListConfig],
  )

  // One pass over the loaded list. ~14 microseconds for 500 entries, so this
  // re-runs freely on every keystroke — see the design doc for why this is not
  // a server-side query.
  //
  // visibleEntries first: an add-on reachable from its parent's card should not
  // be counted by the filter either, or a search would surface something the
  // list does not show.
  const shown = useMemo(() => visibleEntries(entries ?? []), [entries])

  // Derived from `shown`, not from the raw entries: a genre carried only by an
  // add-on hidden under its owned parent would otherwise be offered as a filter
  // that can never match anything.
  const options = useMemo(() => genreOptions(shown), [shown])

  const visible = useMemo(() => shown.filter((entry) => matchesFilters(entry, search, filterGenres)), [shown, search, filterGenres])

  // Sorted per section, over what survived the filter. Not folded into the
  // `visible` useMemo above: each section is sorted independently, and sorting
  // the three together then splitting would give the same answer only because
  // no comparator here looks across categories.
  const byCategory = (category: LIST_TYPE) =>
    sortEntries(
      visible.filter((entry) => entry.category === category),
      sortField,
      sortDirection,
    )

  // Always, not only while filtering. It began as a filtering-only answer to
  // one ambiguity — an open, empty section could mean no matches or no games in
  // that category — and how many games are in each is worth knowing at rest too.
  //
  // The number counts what is *shown*, so it moves as the filter narrows. That
  // is the point: a heading that kept reading "finished (47)" while three cards
  // were on screen would be answering a question nobody asked.
  const sectionTitle = (label: string, category: LIST_TYPE) => `${label} (${byCategory(category).length})`

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
      {/* z-40 puts it above the cards but below the navbar and modal, both
          z-50. Without a stacking order of its own a fixed element still
          paints in document order, so the taller portrait cards covered it. */}
      <MotionContainer type="ease" className="fixed bottom-6 left-6 z-40">
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
          <ListToolbar
            search={search}
            onSearchChange={setSearch}
            genreOptions={options}
            genres={filterGenres}
            onGenresChange={setFilterGenres}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={setSort}
            layout={layout}
            onLayoutChange={setLayout}
            shareUrl={shareUrl}
            // Disabled rather than warned about while the profile is private:
            // the API answers 403 to everyone else, so the link would look
            // broken to the friend and give the owner no clue why.
            shareDisabled={isPrivate}
            shareDisabledReason="Your profile is private — make it public in settings to share it"
          />
          <ListSection
            title={sectionTitle("finished", LIST_TYPE.FINISHED)}
            category={LIST_TYPE.FINISHED}
            entries={byCategory(LIST_TYPE.FINISHED)}
            allEntries={entries}
            onSelectItem={setSelectedEntry}
            open={defaultListConfig.finished}
            onOpenChange={(next) => setDefaultListConfig({ ...defaultListConfig, finished: next })}
            layout={layout}
            isFiltering={isFiltering}
          />
          <ListSection
            title={sectionTitle("currently playing", LIST_TYPE.CURRENTLY_PLAYING)}
            category={LIST_TYPE.CURRENTLY_PLAYING}
            entries={byCategory(LIST_TYPE.CURRENTLY_PLAYING)}
            allEntries={entries}
            onSelectItem={setSelectedEntry}
            open={defaultListConfig.currentlyPlaying}
            onOpenChange={(next) => setDefaultListConfig({ ...defaultListConfig, currentlyPlaying: next })}
            layout={layout}
            isFiltering={isFiltering}
          />
          <ListSection
            title={sectionTitle("want to play", LIST_TYPE.WANT_TO_PLAY)}
            category={LIST_TYPE.WANT_TO_PLAY}
            entries={byCategory(LIST_TYPE.WANT_TO_PLAY)}
            allEntries={entries}
            onSelectItem={setSelectedEntry}
            open={defaultListConfig.wantToPlay}
            onOpenChange={(next) => setDefaultListConfig({ ...defaultListConfig, wantToPlay: next })}
            layout={layout}
            isFiltering={isFiltering}
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
