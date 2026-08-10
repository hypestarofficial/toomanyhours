import { useEffect, useState } from "react"
import Modal from "../../../components/modal/Modal"
import type { UserGame } from "../../../api/generated/models"
import { Image } from "@heroui/image"
import MotionButton from "../../../components/motionButton/MotionButton"
import { Form, useForm } from "react-hook-form"
import DlcList from "./DlcList"
import RatingFields from "../RatingFields"
import type { RatingFormValues } from "../RatingFields"
import { handleError } from "../../../utils/errors"
import { toast } from "sonner"
import Badge from "../../../components/badge/Badge"
import { useUpdateEntry, useRemoveEntry } from "../../../api/userGames"
import { gameCardMode, GAME_CARD_MODE } from "./gameCardMode"
import { parentEntryOf } from "./dlcRows"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import { useGetMeGames } from "../../../api/generated/user-games/user-games"
import useAuthStore from "../../../store/useAuthStore"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"

type GameCardProps = {
  entry: UserGame | null
  onClose: () => void
  /**
   * Swaps the open card to an add-on. MyList owns selectedEntry, so this
   * replaces the modal's subject rather than nesting a second modal inside it.
   */
  onOpenEntry: (entry: UserGame) => void
}

// There is no scale conversion. StarRating renders ten stars with half-steps
// and the API stores 0.5-10 in half-steps, so the form value is the API value.
// The formRatingToApi/apiRatingToForm pair that doubled a five-star control
// into a ten-point scale is gone, and should not come back.
//
// 0 still means unrated in both directions, which matters: it is the API's
// "clear my rating" sentinel.

const GameCard: React.FC<GameCardProps> = ({ entry, onClose, onOpenEntry }) => {
  const { mutateAsync: updateEntry } = useUpdateEntry()
  const { mutateAsync: removeEntry, isPending: removing } = useRemoveEntry()

  // Removal confirms in its own dialog, because an entry can hold a rating and
  // a review the user wrote — words worth naming the game before destroying.
  //
  // Which game is being confirmed, not a bare boolean, so the flag is *derived*
  // against the open entry. A different game cannot inherit an open dialog: it
  // is structurally impossible rather than something a cleanup has to
  // remember. It also keeps setState out of an effect body, which
  // react-hooks/set-state-in-effect rejects for causing cascading renders.
  const [confirmingGameId, setConfirmingGameId] = useState<number | null>(null)
  const confirmOpen = confirmingGameId !== null && confirmingGameId === entry?.gameId

  const mode = gameCardMode(entry?.category)
  const showsForm = mode !== GAME_CARD_MODE.PLAY

  // Opening an add-on replaces this modal's subject rather than nesting a
  // second one, so without a way back, rating three DLCs means reopening the
  // parent three times. Read from the cached list, so it costs no request.
  const { jwtToken } = useAuthStore()
  const { data: entries } = useGetMeGames({ query: { enabled: !!jwtToken } })
  const parent = parentEntryOf(entry, entries ?? [])

  const { control, handleSubmit, reset } = useForm<RatingFormValues>({
    // No mode: "onChange". It existed only to keep isValid live for a button
    // disabled until a rating was picked, and there are no rules left to run.
    defaultValues: {
      rating: 0,
      review: "",
    },
  })

  // defaultValues are only read on first mount, so without this the form keeps
  // whatever the previously opened game had — and saving would overwrite this
  // entry's review with the last one's.
  //
  // Prefills in FINISH mode too, where the stored values may be from an earlier
  // playthrough. Starting blank there would submit an empty review over a real
  // one, so the kept data would survive only until the next Finish.
  useEffect(() => {
    reset({ rating: entry?.rating ?? 0, review: entry?.review ?? "" })
  }, [entry, reset])

  const close = () => {
    reset()
    // Reopening the *same* game with the dialog still open would be
    // surprising, and the derivation above cannot catch that one — the game id
    // has not changed.
    setConfirmingGameId(null)
    onClose()
  }

  // What a completed action does. On an add-on that means going back to the
  // game it belongs to rather than closing everything: you opened it from
  // there, and the next thing you want is usually the next add-on. Closing
  // outright made rating three DLCs mean reopening the parent three times.
  //
  // Removal returns too — the entry is gone, and the parent's list is where
  // you would look to confirm it.
  const finish = () => {
    if (parent) {
      setConfirmingGameId(null)
      onOpenEntry(parent)
      return
    }
    close()
  }

  // Play! is a category-only PATCH — the same request dragging sends, which the
  // API's rating rule already permits.
  const onPlay = async () => {
    if (!entry) return

    try {
      await updateEntry({ gameId: entry.gameId, data: { category: LIST_TYPE.CURRENTLY_PLAYING } })
      toast.success(`${entry.game?.title ?? "Game"} → ${LIST_TYPE_LABEL[LIST_TYPE.CURRENTLY_PLAYING]}`)
      finish()
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not start that game", componentName: "GameCard" })
    }
  }

  const onConfirmRemove = async () => {
    if (!entry) return

    try {
      await removeEntry({ gameId: entry.gameId })
      toast.success(`${entry.game?.title ?? "Game"} removed from your list`)
      finish()
    } catch (error: unknown) {
      // Disarm on failure, so a failed attempt does not leave a primed
      // destructive control behind.
      setConfirmingGameId(null)
      handleError({ error, userMessage: "Could not remove that game", componentName: "GameCard" })
    }
  }

  const onSubmit = async (data: RatingFormValues) => {
    if (!entry) return

    const finishing = mode === GAME_CARD_MODE.FINISH

    try {
      // The category rides along when finishing, so the move and the rating are
      // one request. Two would leave the entry finished-but-unrated if the
      // second failed — and the API judges the resulting category precisely so
      // this does not have to be split.
      await updateEntry({
        gameId: entry.gameId,
        data: {
          ...(finishing ? { category: LIST_TYPE.FINISHED } : {}),
          rating: data.rating,
          review: data.review,
        },
      })
      toast.success(finishing ? `${entry.game?.title ?? "Game"} → ${LIST_TYPE_LABEL[LIST_TYPE.FINISHED]}` : "Saved")
      finish()
    } catch (error: unknown) {
      handleError({ error, userMessage: "An error occurred while rating and reviewing the game", componentName: "GameCard" })
    }
  }

  return (
    <Modal isOpen={!!entry} onClose={close}>
      {/* Fixed width from md up, so the two columns below have somewhere to go.
          Not a Modal `size`: those are min-widths, and a min-width beats a
          max-width in CSS, so a large one would force horizontal overflow on a
          phone. A plain md: width lets the modal grow on a desktop and stay
          inside max-w-[90%] everywhere else. */}
      <Form control={control} className="flex w-full flex-col gap-6 p-6 md:w-[54rem] lg:w-[64rem]">
        {/* Side by side on a desktop, stacked on a phone. The cover is the one
            thing here that is only looked at, so it goes in a column of its own
            and everything you can act on shares the other. */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex w-full flex-col items-center gap-3 md:w-48 md:shrink-0">
            {/* aspect-3/4 matches IGDB cover art. Capped on a phone so the
                cover does not fill the screen before anything else is
                reachable. */}
            {entry?.game?.image && (
              <Image src={entry.game.image} alt={entry.game.title} className="w-full max-w-48 rounded-md object-cover md:max-w-none" />
            )}
            {entry?.game?.genres && (
              <div className="flex w-full flex-wrap items-center justify-center gap-1 md:justify-start">
                {entry.game.genres.map((genre) => (
                  <Badge variant="dark" key={genre.id}>
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* min-w-0 so a long add-on title truncates instead of widening the
              column past the modal. */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* Only on an add-on whose parent you have. It turns opening a DLC
                from a dead end into a loop: rate it, go back, rate the next. */}
            {parent && (
              <MotionButton
                variant="text"
                size="menu"
                className="self-start px-0!"
                icon={<ArrowLeftIcon className="h-4 w-4" />}
                onClick={() => onOpenEntry(parent)}
              >
                <span className="line-clamp-1">Back to {parent.game?.title}</span>
              </MotionButton>
            )}

            {/* PLAY mode shows neither field, even when the row holds a rating
                from a previous stint in finished. */}
            {showsForm && <RatingFields control={control} />}

            {/* Only for a game that could have add-ons. An add-on's own card
                does not list further add-ons — IGDB does not nest them, and a
                DLC of a DLC is not a thing. */}
            {entry?.game && entry.game.kind !== "dlc" && entry.game.kind !== "expansion" && (
              <DlcList igdbId={entry.game.igdbId} onOpenEntry={onOpenEntry} />
            )}
          </div>
        </div>

        {/* Full width beneath both columns: the actions apply to the whole
            card, not to the right-hand one. */}
        <div className="flex w-full items-center justify-between gap-2">
          {/* justify-between rather than a stretched primary. The primary used
              to carry `flex`, which means w-full, and on a card this wide that
              made a green bar the length of the modal. The separation is what
              matters — a destructive control should not sit against the button
              clicked every single time — and the alignment gives that without
              inflating the button. Remove shows in all three modes: a
              want-to-play you have gone off is the likeliest thing anyone
              removes. */}
          <MotionButton variant="error" onClick={() => entry && setConfirmingGameId(entry.gameId)} disabled={removing}>
            Remove
          </MotionButton>

          {/* No Skip. It was the escape hatch from a mandatory rating, and it
              did not finish the game — it closed the modal with a reassuring
              toast. With rating optional, Finish with no stars picked is the
              honest version of that. Plain dismissal is the header's × and the
              backdrop, as everywhere else. */}
          {mode === GAME_CARD_MODE.PLAY && (
            <MotionButton variant="success" onClick={onPlay}>
              Play!
            </MotionButton>
          )}
          {mode === GAME_CARD_MODE.FINISH && (
            <MotionButton variant="success" onClick={handleSubmit(onSubmit)}>
              Finish
            </MotionButton>
          )}
          {mode === GAME_CARD_MODE.EDIT && (
            <MotionButton variant="success" onClick={handleSubmit(onSubmit)}>
              Save
            </MotionButton>
          )}
        </div>
      </Form>

      {/* A second Modal, nested inside the first. Both portal to document.body
          and both are z-50, so the later-mounted one paints on top; there is no
          Escape handler anywhere in Modal, so closing this one cannot close its
          parent by accident. Its own × and backdrop dismiss it.

          Naming the game is the point of a dialog over an inline confirm: the
          thing about to be destroyed says what it is. */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmingGameId(null)} size="xs">
        <div className="flex w-full flex-col gap-6 p-6">
          <p className="text-center">
            Remove <span className="font-semibold">{entry?.game?.title ?? "this game"}</span> from your list? Your rating and review go with
            it.
          </p>
          <div className="flex w-full gap-2">
            <MotionButton variant="error" flex onClick={onConfirmRemove} disabled={removing}>
              Really delete
            </MotionButton>
            <MotionButton flex onClick={() => setConfirmingGameId(null)} disabled={removing}>
              Close
            </MotionButton>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

export default GameCard
