import { UserCircleIcon } from "@heroicons/react/24/solid"
import type { UserGame } from "../../api/generated/models"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../helpers/enums"

type ProfileHeaderProps = {
  username: string
  bio?: string | null
  createdAt: string
  /** Already through visibleEntries, and never the filtered set — these are totals. */
  entries: UserGame[]
}

/** "March 2026". Locale-aware, and the day is noise at this resolution. */
const memberSince = (iso: string): string => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" })

/**
 * Who this list belongs to.
 *
 * **One contained panel, not four things on the page.** The first attempt laid
 * the avatar, name, bio and counts directly on the background, and it read as
 * scattered because nothing grouped them — a card gives the header a single
 * edge, and separates it from the list below without needing a divider.
 *
 * Its own component rather than more props on `Avatar`: that one is the small
 * identity chip the settings page uses beside a form, and this is a page
 * header. Overloading one component to be both is how a component ends up with
 * a `variant` prop nobody can read.
 *
 * The bio is **not** in a fixed-height scrolling box, unlike GameSummary. That
 * constraint exists so a modal is the same height for every game and does not
 * resize under the cursor — a page header has nothing to resize, and 500
 * characters is about five lines. Cropping it produced a half-cut line that
 * read as a rendering bug rather than as an invitation to scroll.
 */
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ username, bio, createdAt, entries }) => {
  const counts = [LIST_TYPE.FINISHED, LIST_TYPE.CURRENTLY_PLAYING, LIST_TYPE.WANT_TO_PLAY]
    .map((category) => ({ label: LIST_TYPE_LABEL[category], count: entries.filter((entry) => entry.category === category).length }))
    .filter((stat) => stat.count > 0)

  return (
    <header className="bg-secondaryBg flex w-full flex-col gap-5 rounded-xl p-6">
      <div className="flex items-center gap-5">
        {/* bg-bg rather than secondaryBg: the panel is already secondaryBg, so
            the placeholder needs the darker tone to read as a distinct shape
            rather than dissolving into the card. */}
        <div className="bg-bg flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <UserCircleIcon className="h-24 w-24 opacity-80" />
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="truncate text-4xl leading-none font-bold">{username}</h1>
          {/* One quiet line of context rather than a row of stat cards: this is
              somebody's reading list, not a dashboard. Categories with nothing
              in them are omitted — "0 currently playing" is not a fact worth
              the space. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs opacity-60">
            <span>{entries.length === 1 ? "1 game" : `${entries.length} games`}</span>
            {counts.map((stat) => (
              <span key={stat.label} className="before:mr-2 before:content-['·']">
                {stat.count} {stat.label.toLowerCase()}
              </span>
            ))}
            <span className="before:mr-2 before:content-['·']">since {memberSince(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Plain prose inside the card, not a nested box: a second grey container
          on a grey panel reads as a disabled input rather than as something a
          person wrote. Capped at a readable measure so a wide screen does not
          stretch it into one long ragged line, and pre-wrap so the writer's own
          line breaks survive. */}
      {bio && <p className="max-w-2xl text-sm leading-relaxed whitespace-pre-wrap opacity-80">{bio}</p>}
    </header>
  )
}

export default ProfileHeader
