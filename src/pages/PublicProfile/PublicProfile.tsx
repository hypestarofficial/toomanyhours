import { useMemo, useState } from "react"
import { useParams } from "react-router"
import Page from "../../components/page/Page"
import Loader from "../../components/loader/Loader"
import Empty from "../../components/empty/Empty"
import MotionContainer from "../../components/motionContainer/MotionContainer"
import ProfileHeader from "./ProfileHeader"
import ListSection from "../MyList/listSection/ListSection"
import ProfileGameCard from "./ProfileGameCard"
import { LIST_TYPE } from "../../helpers/enums"
import { LIST_LAYOUT } from "../../store/useUserSettingsAuth"
import type { UserGame } from "../../api/generated/models"
import { useGetProfile } from "../../api/generated/profiles/profiles"
import { ApiError } from "../../api/apiError"
import { visibleEntries } from "../../list/visibleEntries"
import ListToolbar from "../../components/listToolbar/ListToolbar"
import { profileShareUrl } from "../../helpers/shareUrl"
import { matchesFilters } from "../../list/filters"
import { NATURAL_DIRECTION, SORT_DIRECTION, SORT_FIELD, sortEntries } from "../../list/sort"
import { genreOptions } from "../../list/genreOptions"

const PublicProfile: React.FC = () => {
  const { username } = useParams()
  const [selectedEntry, setSelectedEntry] = useState<UserGame | null>(null)
  // Section open state is local, not the persisted store: this is someone
  // else's list and should not disturb how yours is arranged.
  const [open, setOpen] = useState({ finished: true, currentlyPlaying: true, wantToPlay: true })

  // Every one of these is local, and that is the point: filtering or sorting
  // someone else's list must not leave your own list filtered when you go back.
  // `filterGenres` and `layout` live in the shared store — the first is shared
  // across the app and the second is persisted — so reading either here would
  // change a setting the visitor never touched, on a page that is not theirs.
  // The section open state above is already local for this reason.
  const [search, setSearch] = useState("")
  const [genres, setGenres] = useState<number[]>([])
  const [sortField, setSortField] = useState<SORT_FIELD>(SORT_FIELD.RATING)
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(NATURAL_DIRECTION[SORT_FIELD.RATING])
  const [layout, setLayout] = useState<LIST_LAYOUT>(LIST_LAYOUT.CARDS)

  const setSort = (field: SORT_FIELD, direction: SORT_DIRECTION) => {
    setSortField(field)
    setSortDirection(direction)
  }

  // No `enabled: !!jwtToken`, unlike every other query in this app. The whole
  // point is that a visitor with no account sees this.
  const { data: profile, isLoading, error } = useGetProfile(username ?? "")

  // Above the early returns below, because hooks cannot be called
  // conditionally — and `profile` is undefined until the query resolves.
  const entries = useMemo(() => profile?.entries ?? [], [profile])

  const isFiltering = search.trim() !== "" || genres.length > 0

  // The same order MyList uses: hide add-ons under owned parents, then filter,
  // then sort per section. Split so the genre options come from the same set
  // the filter runs over — deriving from the raw entries would offer a genre
  // carried only by an add-on hidden under its owned parent, which can never
  // match anything.
  const shown = useMemo(() => visibleEntries(entries), [entries])

  const options = useMemo(() => genreOptions(shown), [shown])

  const visible = useMemo(() => shown.filter((entry) => matchesFilters(entry, search, genres)), [shown, search, genres])

  const byCategory = (category: LIST_TYPE) =>
    sortEntries(
      visible.filter((entry) => entry.category === category),
      sortField,
      sortDirection,
    )

  // `/api` is the prefix httpRequest hardcodes and vite.config.ts proxies away.
  // An image URL has to carry it too, because the browser fetches this directly
  // rather than through the wrapper. The `?v=` is what earns the immutable cache
  // header; without it the server answers no-cache and every visit refetches.
  const avatarUrl = profile?.avatarHash ? `/api/profiles/${encodeURIComponent(profile.username)}/avatar?v=${profile.avatarHash}` : null

  if (isLoading) {
    return <Loader fullPage />
  }

  if (error || !profile) {
    // 403 and 404 say different things and a visitor deserves to know which:
    // one means the list exists and is not for them, the other that the link
    // is wrong.
    const isPrivate = error instanceof ApiError && error.status === 403
    return (
      <Page align="start">
        <Empty message={isPrivate ? "This profile is private" : "No such profile"} fullPage bold />
      </Page>
    )
  }

  return (
    <Page align="start">
      <MotionContainer className="flex w-full flex-col gap-5 pb-10">
        {/* `shown`, not `visible`: these are totals, so they must not move when
            somebody types in the search box. */}
        <ProfileHeader username={profile.username} bio={profile.bio} createdAt={profile.createdAt} entries={shown} avatarUrl={avatarUrl} />

        <ListToolbar
          search={search}
          onSearchChange={setSearch}
          searchId="profileSearch"
          searchPlaceholder={`Search ${profile.username}'s list...`}
          genreOptions={options}
          genres={genres}
          onGenresChange={setGenres}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={setSort}
          layout={layout}
          onLayoutChange={setLayout}
          // Never disabled: if this page rendered at all, the profile is
          // public — the API answered rather than returning 403.
          shareUrl={profileShareUrl(window.location.origin, profile.username)}
        />

        {/* `isFiltering ||` rather than MyList's snapshot-and-restore effect: a
            match can be inside a collapsed section, so filtering has to reveal
            it. MyList needs a ref and a transition-guarded effect because its
            open state is persisted and shared; this page's is local, so the
            same behaviour is one derived expression with nothing to keep in
            sync and nothing to clean up on unmount.

            `allEntries` stays the *unfiltered* set on all three, as does
            ProfileGameCard's `entries` below: the cover marks count a game's
            add-ons and the card lists them, so passing the filtered array would
            make an add-on count change as the visitor types in the search box. */}
        <ListSection
          title="finished"
          category={LIST_TYPE.FINISHED}
          entries={byCategory(LIST_TYPE.FINISHED)}
          allEntries={profile.entries}
          onSelectItem={setSelectedEntry}
          open={isFiltering || open.finished}
          onOpenChange={(next) => setOpen({ ...open, finished: next })}
          layout={layout}
          readOnly
        />
        <ListSection
          title="currently playing"
          category={LIST_TYPE.CURRENTLY_PLAYING}
          entries={byCategory(LIST_TYPE.CURRENTLY_PLAYING)}
          allEntries={profile.entries}
          onSelectItem={setSelectedEntry}
          open={isFiltering || open.currentlyPlaying}
          onOpenChange={(next) => setOpen({ ...open, currentlyPlaying: next })}
          layout={layout}
          readOnly
        />
        <ListSection
          title="want to play"
          category={LIST_TYPE.WANT_TO_PLAY}
          entries={byCategory(LIST_TYPE.WANT_TO_PLAY)}
          allEntries={profile.entries}
          onSelectItem={setSelectedEntry}
          open={isFiltering || open.wantToPlay}
          onOpenChange={(next) => setOpen({ ...open, wantToPlay: next })}
          layout={layout}
          readOnly
        />
      </MotionContainer>

      {/* All the entries, not the filtered ones: the card shows this game's
          add-ons, which are exactly what visibleEntries took out. */}
      <ProfileGameCard entry={selectedEntry} entries={profile.entries} onClose={() => setSelectedEntry(null)} />
    </Page>
  )
}

export default PublicProfile
