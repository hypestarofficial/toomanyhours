import { toast } from "sonner"
import { Image } from "@heroui/image"
import { ChatBubbleBottomCenterTextIcon, ChevronRightIcon, StarIcon } from "@heroicons/react/24/solid"
import MotionButton from "../../../components/motionButton/MotionButton"
import Loader from "../../../components/loader/Loader"
import placeholderImage from "../../../assets/images/placeholder.webp"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import { useGetGameDlcs } from "../../../api/generated/games/games"
import { useGetMeGames } from "../../../api/generated/user-games/user-games"
import { useAddGame, useUpdateEntry } from "../../../api/userGames"
import useAuthStore from "../../../store/useAuthStore"
import { handleError } from "../../../utils/errors"
import { cn } from "../../../utils/cn"
import { canOpenAddOn, dlcRow } from "./dlcRows"
import type { UserGame } from "../../../api/generated/models"

// Shorter than LIST_TYPE_LABEL, and only here. Three buttons share one line
// with the title, and "Currently playing" spelled out either wraps the row or
// squeezes the title to nothing. The full wording survives as the tooltip and
// in the toast, so nothing is lost — this is the only place in the app where
// the labels are abbreviated, which is why they live here rather than in
// helpers/enums.
const DLC_CATEGORY_LABEL: Record<LIST_TYPE, string> = {
  [LIST_TYPE.FINISHED]: "Finished",
  [LIST_TYPE.CURRENTLY_PLAYING]: "Playing",
  [LIST_TYPE.WANT_TO_PLAY]: "Want",
}

type DlcListProps = {
  /** The parent game's IGDB id. */
  igdbId: number
  /** Opens an add-on's own detail modal — see the comment on the row below. */
  onOpenEntry: (entry: UserGame) => void
}

/**
 * A game's DLC and expansions, listed from IGDB rather than from the catalog:
 * the point is to show add-ons you have *not* added, and the catalog only ever
 * holds the ones somebody has.
 *
 * Always visible rather than collapsed. A section you have to find first is
 * one most people never find, and the whole reason add-ons were moved onto the
 * card was so they would be somewhere obvious.
 *
 * The cost of that is a request to IGDB whenever a card opens. TanStack Query
 * caches per game, so reopening the same one is free, and the client's own
 * throttle bounds the rest.
 */
const DlcList: React.FC<DlcListProps> = ({ igdbId, onOpenEntry }) => {
  const { jwtToken } = useAuthStore()

  // `enabled` is passed explicitly, as every generated hook in this app needs:
  // without it the query fires before a token exists and 401s on boot.
  const { data: dlcs, isLoading } = useGetGameDlcs(igdbId, { query: { enabled: !!jwtToken } })
  const { data: entries } = useGetMeGames({ query: { enabled: !!jwtToken } })

  const { mutateAsync: addGame } = useAddGame()
  const { mutateAsync: updateEntry } = useUpdateEntry()

  const choose = async (targetIgdbId: number, entry: UserGame | undefined, category: LIST_TYPE) => {
    try {
      if (entry) {
        await updateEntry({ gameId: entry.gameId, data: { category } })
      } else {
        // No rating or review: these buttons set a category and nothing else.
        // The add-on's own card, reached by clicking the row, does the rest.
        await addGame({ data: { igdbId: targetIgdbId, category } })
      }
      toast.success(`Moved to ${LIST_TYPE_LABEL[category]}`)
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not update that add-on", componentName: "DlcList" })
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <h4 className="font-semibold select-none">DLC & expansions</h4>

      {isLoading ? (
        <Loader />
      ) : !dlcs?.length ? (
        // The heading stays and says so, rather than the section vanishing.
        // A section that is sometimes absent makes you wonder whether you
        // missed it; one that says "none" answers the question.
        <p className="text-sm opacity-60">No add-ons available.</p>
      ) : (
        // A ceiling, because this list is unbounded: Dave the Diver has a dozen
        // add-ons, and without one they push the Save button off the bottom of
        // the screen. Scrolling inside keeps the card a fixed shape however
        // many IGDB returns.
        <div className="flex max-h-80 w-full flex-col gap-1 overflow-y-auto pr-1">
          {dlcs?.map((dlc) => {
            const row = dlcRow(dlc, entries ?? [])
            const year = dlc.releaseDate?.slice(0, 4)
            const openable = canOpenAddOn(row.category)

            return (
              <div
                key={dlc.igdbId}
                className="hover:bg-secondaryBg flex flex-col gap-2 rounded-md p-1.5 transition-colors sm:flex-row sm:items-center sm:gap-3"
              >
                {/* The whole left side opens this add-on's own card, where its
                    rating, review and Remove live. Without that route in, an
                    add-on hidden from the list would be unreachable — Gears 5:
                    Hivebusters already carries a rating.

                    Only for something finished or being played: see
                    canOpenAddOn. A want-to-play card has no rating, no review
                    and no add-on list of its own, so it opens on nothing. */}
                <button
                  type="button"
                  disabled={!openable}
                  onClick={() => row.entry && onOpenEntry(row.entry)}
                  title={openable ? `Open ${dlc.title}` : undefined}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3 text-left",
                    openable ? "hover:text-primary cursor-pointer" : "cursor-default",
                  )}
                >
                  {/* 3:4, matching IGDB cover art, so the thumbnail is not cropped. */}
                  <Image
                    src={dlc.image || placeholderImage}
                    alt={dlc.title}
                    className="pointer-events-none h-11 w-8 shrink-0 rounded object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    {/* Two lines, not one. Add-on titles repeat their parent's
                        name before saying anything distinguishing — "Dave the
                        Diver: Ichiban's Holiday" — so a single clamped line
                        cuts off the only part worth reading. */}
                    <span className="line-clamp-2 text-sm leading-tight">{dlc.title}</span>
                    <span className="flex items-center gap-2 text-xs opacity-60">
                      {year ?? "Unreleased"}
                      {/* Shown here so the list doubles as a summary of what
                          you scored, rather than something you learn only by
                          opening each one. */}
                      {row.entry?.rating != null && (
                        <span className="flex items-center gap-0.5">
                          <StarIcon className="text-primary h-3 w-3" />
                          {row.entry.rating}
                        </span>
                      )}
                      {/* The same mark the list cards carry, for the same
                          reason: whether an entry has been written about is
                          the thing worth spotting without opening it. */}
                      {row.entry?.review && (
                        <span title="Written review" aria-label="Written review" className="flex items-center">
                          <ChatBubbleBottomCenterTextIcon className="text-primary h-3 w-3" />
                        </span>
                      )}
                    </span>
                  </div>
                  {/* The affordance. Without it, a row that silently becomes
                      clickable reads as plain text. */}
                  {openable && <ChevronRightIcon className="h-4 w-4 shrink-0 opacity-60" />}
                </button>

                {/* No `flex` on these: that prop means w-full, which is what
                    stacked them into three rows apiece. Sized to their labels,
                    they fit on one line beside the title. */}
                <div className="flex shrink-0 gap-1">
                  {Object.values(LIST_TYPE).map((value) => (
                    <MotionButton
                      key={value}
                      size="menu"
                      // Tighter than `menu` alone. These are three secondary
                      // controls repeated on every row, so at the default size
                      // they out-shout the titles they belong to.
                      className="px-2! py-0.5! text-xs!"
                      variant={row.category === value ? "active" : "default"}
                      onClick={() => choose(dlc.igdbId, row.entry, value)}
                      title={`Move to ${LIST_TYPE_LABEL[value]}`}
                    >
                      {DLC_CATEGORY_LABEL[value]}
                    </MotionButton>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DlcList
