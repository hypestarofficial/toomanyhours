import { useEffect, useState } from "react"
import Modal from "../../../components/modal/Modal"
import type { UserGame } from "../../../api/generated/models"
import { Image } from "@heroui/image"
import MotionButton from "../../../components/motionButton/MotionButton"
import { Form, useForm } from "react-hook-form"
import DlcList from "./DlcList"
import GameSummary from "../../../components/gameSummary/GameSummary"
import RatingFields from "../RatingFields"
import type { RatingFormValues } from "../RatingFields"
import { handleError } from "../../../utils/errors"
import { toast } from "sonner"
import Badge from "../../../components/badge/Badge"
import { useUpdateEntry, useRemoveEntry } from "../../../api/userGames"
import { gameCardMode, GAME_CARD_MODE } from "./gameCardMode"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"

type GameCardProps = {
  entry: UserGame | null
  onClose: () => void
}

// There is no scale conversion. StarRating renders ten stars with half-steps
// and the API stores 0.5-10 in half-steps, so the form value is the API value.
// The formRatingToApi/apiRatingToForm pair that doubled a five-star control
// into a ten-point scale is gone, and should not come back.
//
// 0 still means unrated in both directions, which matters: it is the API's
// "clear my rating" sentinel.

const GameCard: React.FC<GameCardProps> = ({ entry, onClose }) => {
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<RatingFormValues>({
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

  // Play! is a category-only PATCH — the same request dragging sends, which the
  // API's rating rule already permits.
  const onPlay = async () => {
    if (!entry) return

    try {
      await updateEntry({ gameId: entry.gameId, data: { category: LIST_TYPE.CURRENTLY_PLAYING } })
      toast.success(`${entry.game?.title ?? "Game"} → ${LIST_TYPE_LABEL[LIST_TYPE.CURRENTLY_PLAYING]}`)
      close()
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not start that game", componentName: "GameCard" })
    }
  }

  const onConfirmRemove = async () => {
    if (!entry) return

    try {
      await removeEntry({ gameId: entry.gameId })
      toast.success(`${entry.game?.title ?? "Game"} removed from your list`)
      close()
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
      close()
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
            {/* First in the column: a description is what you read before
                deciding anything else on this card. */}
            <GameSummary summary={entry?.game?.summary} />

            {/* PLAY mode shows neither field, even when the row holds a rating
                from a previous stint in finished. */}
            {showsForm && <RatingFields control={control} />}

            {/* Only for a game that could have add-ons. An add-on's own card
                does not list further add-ons — IGDB does not nest them, and a
                DLC of a DLC is not a thing. */}
            {entry?.game && entry.game.kind !== "dlc" && entry.game.kind !== "expansion" && (
              <DlcList igdbId={entry.game.igdbId} parentTitle={entry.game.title} />
            )}
          </div>
        </div>

        {/* Full width beneath both columns: the actions apply to the whole
            card, not to the right-hand one. */}
        <div className="flex w-full items-center justify-center gap-3">
          {/* Centred as a pair, at their natural size. Neither carries `flex`,
              which means w-full and turned the primary into a green bar the
              length of a 64rem card.

              This does put Remove beside the button clicked every time, which
              earlier layouts kept apart. It is survivable here because Remove
              opens a confirmation naming the game rather than acting straight
              away — the dialog is what makes the adjacency safe, so it must
              stay. Remove shows in all three modes: a want-to-play you have
              gone off is the likeliest thing anyone removes. */}
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
          {/* Save alone is disabled until something changes. There is nothing
              to save on an untouched finished entry, and an always-live Save
              gives no clue whether an edit registered.

              Finish is not gated the same way: it moves the entry to finished,
              which is a real change even when neither field was touched.

              isDirty is honest here because the effect above resets the form to
              the entry's own values whenever a card opens, so a freshly opened
              card starts clean rather than counting the prefill as an edit. */}
          {mode === GAME_CARD_MODE.EDIT && (
            <MotionButton variant="success" onClick={handleSubmit(onSubmit)} disabled={!isDirty}>
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
