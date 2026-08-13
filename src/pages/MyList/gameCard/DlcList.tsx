import { useState } from "react"
import { Image } from "@heroui/image"
import { ChatBubbleBottomCenterTextIcon, StarIcon } from "@heroicons/react/24/solid"
import MotionButton from "../../../components/motionButton/MotionButton"
import Badge from "../../../components/badge/Badge"
import Loader from "../../../components/loader/Loader"
import placeholderImage from "../../../assets/images/placeholder.webp"
import { LIST_TYPE, LIST_TYPE_BADGE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import { useGetGameDlcs } from "../../../api/generated/games/games"
import { useGetMeGames } from "../../../api/generated/user-games/user-games"
import useAuthStore from "../../../store/useAuthStore"
import { dlcRow, stripParentTitle } from "./dlcRows"
import AddOnModal from "./AddOnModal"
import type { IGDBGame } from "../../../api/generated/models"

type DlcListProps = {
  /** The parent game's IGDB id. */
  igdbId: number
  /** The parent game's title, so add-on rows can drop it from theirs. */
  parentTitle?: string
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
 *
 * Rows report status, score and whether there is a review, and do nothing
 * else. Everything you can change lives behind Manage, in a dialog over this
 * card.
 */
const DlcList: React.FC<DlcListProps> = ({ igdbId, parentTitle }) => {
  const { jwtToken } = useAuthStore()
  const [managing, setManaging] = useState<IGDBGame | null>(null)

  // `enabled` is passed explicitly, as every generated hook in this app needs:
  // without it the query fires before a token exists and 401s on boot.
  const { data: dlcs, isLoading } = useGetGameDlcs(igdbId, { query: { enabled: !!jwtToken } })
  const { data: entries } = useGetMeGames({ query: { enabled: !!jwtToken } })

  return (
    // min-h-0 flex-1: this section absorbs whatever height the card has left.
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
      <div className="flex w-full items-center justify-between gap-2">
        <h4 className="text-sm font-semibold select-none">DLC &amp; expansions</h4>
        {/* Only once they have arrived. A count of 0 mid-fetch would read as
            "none" a moment before the list appears. */}
        {!isLoading && dlcs && <span className="text-sm opacity-60 select-none">{dlcs.length}</span>}
      </div>

      {isLoading ? (
        <Loader />
      ) : !dlcs?.length ? (
        // The heading stays and says so, rather than the section vanishing.
        // A section that is sometimes absent makes you wonder whether you
        // missed it; one that says "none" answers the question.
        <p className="text-sm opacity-60">No add-ons available.</p>
      ) : (
        // Flexes into the room the card has left rather than a guessed
        // max-height, so the modal itself does not also scroll — two nested
        // scrollbars leave you unsure which one the wheel will move. min-h-40
        // is the floor: below that the card overflows and the modal scrolls,
        // which is the graceful fallback on a very short screen.
        <div className="flex min-h-40 w-full flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {dlcs.map((dlc) => {
            const row = dlcRow(dlc, entries ?? [])
            const year = dlc.releaseDate?.slice(0, 4)
            const category = row.category as LIST_TYPE | undefined

            return (
              <div
                key={dlc.igdbId}
                className="hover:bg-secondaryBg flex flex-col gap-2 rounded-md p-1.5 transition-colors sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* 3:4, matching IGDB cover art, so the thumbnail is not cropped. */}
                  <Image
                    src={dlc.image || placeholderImage}
                    alt={dlc.title}
                    className="pointer-events-none h-11 w-8 shrink-0 rounded object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {/* Two lines, not one. Add-on titles repeat their parent's
                        name before saying anything distinguishing — "Dave the
                        Diver: Ichiban's Holiday" — so a single clamped line
                        cuts off the only part worth reading. */}
                    <span className="line-clamp-2 text-sm leading-tight">{stripParentTitle(dlc.title, parentTitle)}</span>
                    <span className="flex flex-wrap items-center gap-2 text-xs opacity-60">
                      {year ?? "Unreleased"}
                      {/* Status, score, and whether it was written about: what
                          this list gets scanned for, so none of it needs the
                          dialog opened to be seen. */}
                      {category && <Badge variant={LIST_TYPE_BADGE[category]}>{LIST_TYPE_LABEL[category]}</Badge>}
                      {row.entry?.rating != null && (
                        <span className="text-primary flex items-center gap-0.5 font-semibold">
                          <StarIcon className="h-3 w-3" />
                          {row.entry.rating}
                        </span>
                      )}
                      {row.entry?.review && (
                        <span title="Written review" aria-label="Written review" className="flex items-center">
                          <ChatBubbleBottomCenterTextIcon className="text-primary h-3 w-3" />
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* One control per row. It replaced three category buttons and
                    a chevron: the dialog behind it does everything they did,
                    plus rating, review and removal, and it works the same
                    whether or not the add-on is already in your list. */}
                <MotionButton
                  size="menu"
                  className="shrink-0 px-2! py-0.5! text-xs!"
                  onClick={() => setManaging(dlc)}
                  title={`Manage ${dlc.title}`}
                >
                  Manage
                </MotionButton>
              </div>
            )
          })}
        </div>
      )}

      {/* Nested over the game's card, so closing it returns you here rather
          than to nothing. The entry is looked up at render rather than
          captured, so a save is reflected the moment the list refetches. */}
      <AddOnModal addOn={managing} entry={managing ? dlcRow(managing, entries ?? []).entry : undefined} onClose={() => setManaging(null)} />
    </div>
  )
}

export default DlcList
