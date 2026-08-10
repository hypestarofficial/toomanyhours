import { useState } from "react"
import { toast } from "sonner"
import { Image } from "@heroui/image"
import MotionCollapse from "../../../components/motionCollapse/MotionCollapse"
import MotionButton from "../../../components/motionButton/MotionButton"
import Empty from "../../../components/empty/Empty"
import placeholderImage from "../../../assets/images/placeholder.webp"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import { useGetGameDlcs } from "../../../api/generated/games/games"
import { useGetMeGames } from "../../../api/generated/user-games/user-games"
import { useAddGame, useUpdateEntry } from "../../../api/userGames"
import useAuthStore from "../../../store/useAuthStore"
import { handleError } from "../../../utils/errors"
import { dlcRow } from "./dlcRows"
import type { UserGame } from "../../../api/generated/models"

type DlcListProps = {
  /** The parent game's IGDB id. */
  igdbId: number
  /** Opens an add-on's own detail modal — see the comment on the title below. */
  onOpenEntry: (entry: UserGame) => void
}

/**
 * A game's DLC and expansions, listed from IGDB rather than from the catalog:
 * the point is to show add-ons you have *not* added, and the catalog only ever
 * holds the ones somebody has.
 *
 * Collapsed by default and fetched only while open, so a game nobody expands
 * costs no request and the modal does not grow for it.
 */
const DlcList: React.FC<DlcListProps> = ({ igdbId, onOpenEntry }) => {
  const [open, setOpen] = useState(false)
  const { jwtToken } = useAuthStore()

  // `enabled` is passed explicitly, as every generated hook in this app needs:
  // without it the query fires before a token exists and 401s on boot.
  const { data: dlcs, isFetching } = useGetGameDlcs(igdbId, { query: { enabled: !!jwtToken && open } })
  const { data: entries } = useGetMeGames({ query: { enabled: !!jwtToken } })

  const { mutateAsync: addGame } = useAddGame()
  const { mutateAsync: updateEntry } = useUpdateEntry()

  const choose = async (targetIgdbId: number, entry: UserGame | undefined, category: LIST_TYPE) => {
    try {
      if (entry) {
        await updateEntry({ gameId: entry.gameId, data: { category } })
      } else {
        // No rating or review: this control sets a category and nothing else.
        // The add-on's own modal, reached from its title, does the rest.
        await addGame({ data: { igdbId: targetIgdbId, category } })
      }
      toast.success(`Moved to ${LIST_TYPE_LABEL[category]}`)
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not update that add-on", componentName: "DlcList" })
    }
  }

  return (
    <MotionCollapse title="DLC & expansions" open={open} onOpenChange={setOpen} isLoading={isFetching}>
      {dlcs && dlcs.length > 0 ? (
        <div className="flex w-full flex-col gap-3">
          {dlcs.map((dlc) => {
            const row = dlcRow(dlc, entries ?? [])
            const year = dlc.releaseDate?.slice(0, 4)

            return (
              <div key={dlc.igdbId} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {/* 3:4, matching IGDB cover art, so the thumbnail is not cropped. */}
                  <Image
                    src={dlc.image || placeholderImage}
                    alt={dlc.title}
                    className="pointer-events-none h-12 w-9 shrink-0 rounded object-cover"
                  />
                  {/* The title opens this add-on's own card when you own it.
                      Without that route back in, an add-on that hides from the
                      list takes its rating and review with it — Gears 5:
                      Hivebusters already has one. */}
                  <button
                    type="button"
                    disabled={!row.entry}
                    onClick={() => row.entry && onOpenEntry(row.entry)}
                    className="enabled:hover:text-primary flex min-w-0 flex-1 flex-col text-left disabled:cursor-default"
                  >
                    <span className="line-clamp-1 text-sm">{dlc.title}</span>
                    <span className="text-xs opacity-60">{year ?? "Unreleased"}</span>
                  </button>
                </div>
                <div className="flex w-full flex-wrap gap-1">
                  {Object.values(LIST_TYPE).map((value) => (
                    <MotionButton
                      key={value}
                      flex
                      size="menu"
                      variant={row.category === value ? "active" : "default"}
                      onClick={() => choose(dlc.igdbId, row.entry, value)}
                    >
                      {LIST_TYPE_LABEL[value]}
                    </MotionButton>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Empty message={isFetching ? "Loading…" : "No DLC for this game"} />
      )}
    </MotionCollapse>
  )
}

export default DlcList
