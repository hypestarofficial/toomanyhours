import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Image } from "@heroui/image"
import Modal from "../../../components/modal/Modal"
import MotionButton from "../../../components/motionButton/MotionButton"
import RatingFields from "../RatingFields"
import type { RatingFormValues } from "../RatingFields"
import placeholderImage from "../../../assets/images/placeholder.webp"
import { LIST_TYPE, LIST_TYPE_LABEL } from "../../../helpers/enums"
import { useAddGame, useUpdateEntry, useRemoveEntry } from "../../../api/userGames"
import { addGamePayload, editEntryPayload } from "../addGameModal/payload"
import { handleError } from "../../../utils/errors"
import type { IGDBGame, UserGame } from "../../../api/generated/models"

type AddOnModalProps = {
  /** The add-on being managed, straight from IGDB. Null closes the dialog. */
  addOn: IGDBGame | null
  /** Your entry for it, when you already have it. Absent means adding. */
  entry: UserGame | undefined
  onClose: () => void
}

/**
 * Managing one add-on: its category, its rating, its review, and removing it.
 *
 * A dialog nested over the parent's card rather than a screen that replaces
 * it. Closing therefore returns you to the game you opened it from with no
 * back control, no swapping of the modal's subject, and no rule about which
 * add-ons may be opened — the whole of which this replaced.
 *
 * It does not care whether you already have the add-on. No entry means Save
 * creates one; an entry means Save patches it. That is what gives a
 * want-to-play add-on a Remove, which it had no route to when the only way in
 * was a card it could not open.
 */
const AddOnModal: React.FC<AddOnModalProps> = ({ addOn, entry, onClose }) => {
  // Both flags are keyed on *which* add-on they belong to and derived against
  // the open one, rather than synced in an effect — which is what keeps
  // setState out of an effect body, where react-hooks/set-state-in-effect
  // rejects it for causing cascading renders.
  //
  // The key stops a *different* add-on inheriting either flag, and that is all
  // it stops. Reopening the same one matches its own id, so `close()` below
  // still has to clear them; this is not the structural guarantee it looks
  // like. GameCard's remove dialog has the same shape and the same caveat.
  const [picked, setPicked] = useState<{ igdbId: number; category: LIST_TYPE } | null>(null)
  const [confirmingIgdbId, setConfirmingIgdbId] = useState<number | null>(null)

  // Both operands checked explicitly: `picked?.igdbId === addOn?.igdbId` is
  // true when both are null, which took the picked branch and dereferenced it.
  const category = picked && addOn && picked.igdbId === addOn.igdbId ? picked.category : ((entry?.category as LIST_TYPE) ?? null)
  const confirming = confirmingIgdbId !== null && confirmingIgdbId === addOn?.igdbId

  const setCategory = (value: LIST_TYPE) => addOn && setPicked({ igdbId: addOn.igdbId, category: value })

  // Both flags must be dropped on the way out, and keying them is not enough:
  // the key only stops a *different* add-on inheriting them. Reopening the
  // *same* one matches its own id, so a confirmation left set survived a
  // delete, a re-add and a reopen — and greeted you with a primed delete
  // dialog. An unsaved category pick had the same shape, quieter: it would
  // have shown over the stored one.
  const close = () => {
    setPicked(null)
    setConfirmingIgdbId(null)
    onClose()
  }

  const { mutateAsync: addGame, isPending: adding } = useAddGame()
  const { mutateAsync: updateEntry, isPending: updating } = useUpdateEntry()
  const { mutateAsync: removeEntry, isPending: removing } = useRemoveEntry()

  const { control, reset, getValues } = useForm<RatingFormValues>({
    defaultValues: { rating: 0, review: "" },
  })

  // Seeded from the entry each time a different add-on is opened.
  // defaultValues are read once on mount, so without this the dialog would
  // keep the previous add-on's review and save it over this one's. `reset` is
  // not a setState, which is why this effect is allowed where the two flags
  // above are not.
  useEffect(() => {
    reset({ rating: entry?.rating ?? 0, review: entry?.review ?? "" })
  }, [addOn, entry, reset])

  const busy = adding || updating || removing
  const scored = category === LIST_TYPE.FINISHED

  const onSave = async () => {
    if (!addOn || !category) return

    const fields = getValues()

    try {
      if (entry) {
        // 0 and "" are sent here to clear; the add path must omit them. The two
        // rules live in payload.ts, tested, because getting either wrong fails
        // at the API rather than anywhere a component test would look.
        await updateEntry({ gameId: entry.gameId, data: editEntryPayload(category, fields) })
      } else {
        await addGame({ data: addGamePayload(addOn.igdbId, category, fields) })
      }
      toast.success(`${addOn.title} → ${LIST_TYPE_LABEL[category]}`)
      close()
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not save that add-on", componentName: "AddOnModal" })
    }
  }

  const onConfirmRemove = async () => {
    if (!entry || !addOn) return

    try {
      await removeEntry({ gameId: entry.gameId })
      toast.success(`${addOn.title} removed from your list`)
      close()
    } catch (error: unknown) {
      // Disarm on failure, so a failed attempt does not leave a primed
      // destructive control behind.
      setConfirmingIgdbId(null)
      handleError({ error, userMessage: "Could not remove that add-on", componentName: "AddOnModal" })
    }
  }

  const year = addOn?.releaseDate?.slice(0, 4)

  return (
    <Modal isOpen={!!addOn} onClose={close} size="sm">
      <div className="flex w-full flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <Image
            src={addOn?.image || placeholderImage}
            alt={addOn?.title}
            className="pointer-events-none h-20 w-15 shrink-0 rounded object-cover"
          />
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold">{addOn?.title}</span>
            <span className="text-xs opacity-60">{year ?? "Unreleased"}</span>
          </div>
        </div>

        {/* Buttons rather than a dropdown, for the same reason as step 2 of the
            add flow: choosing finished reveals the fields below, and a reveal
            triggered from inside a collapsed control reads as the dialog
            growing on its own. */}
        <div className="flex w-full flex-wrap gap-2">
          {Object.values(LIST_TYPE).map((value) => (
            <MotionButton
              key={value}
              flex
              size="menu"
              variant={category === value ? "active" : "default"}
              onClick={() => setCategory(value)}
            >
              {LIST_TYPE_LABEL[value]}
            </MotionButton>
          ))}
        </div>

        {/* Only on finished, because the API rejects a rating or a review on
            any other category. Both stay optional. */}
        {scored && <RatingFields control={control} />}

        <div className="flex w-full items-center justify-center gap-3">
          {entry && (
            <MotionButton variant="error" onClick={() => addOn && setConfirmingIgdbId(addOn.igdbId)} disabled={busy}>
              Remove
            </MotionButton>
          )}
          <MotionButton variant="success" onClick={onSave} disabled={!category || busy}>
            Save
          </MotionButton>
        </div>
      </div>

      {/* Three modals deep at this point: the game's card, this dialog, and
          this confirmation. Modal refcounts the body scroll lock for exactly
          that, and the later mount paints on top. */}
      <Modal isOpen={confirming} onClose={() => setConfirmingIgdbId(null)} size="xs">
        <div className="flex w-full flex-col gap-6 p-6">
          <p className="text-center">
            Remove <span className="font-semibold">{addOn?.title}</span> from your list? Your rating and review go with it.
          </p>
          <div className="flex w-full gap-2">
            <MotionButton variant="error" flex onClick={onConfirmRemove} disabled={removing}>
              Really delete
            </MotionButton>
            <MotionButton flex onClick={() => setConfirmingIgdbId(null)} disabled={removing}>
              Close
            </MotionButton>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

export default AddOnModal
