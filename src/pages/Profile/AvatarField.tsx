import { useState } from "react"
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"
import Avatar from "../../components/avatar/Avatar"
import Modal from "../../components/modal/Modal"
import MotionButton from "../../components/motionButton/MotionButton"
import useAuthStore from "../../store/useAuthStore"
import { deleteAvatar, uploadAvatar } from "../../api/endpoints/avatar"
import { resizeImage } from "../../utils/resizeImage"
import { handleError } from "../../utils/errors"
import AvatarUploadModal from "./AvatarUploadModal"

/**
 * The profile photo: change it, or remove the one there is.
 *
 * Both writes return the whole account and are written straight into the auth
 * store, so the navbar changes in the same tick — the store is what the app
 * renders identity from, and a refetch would leave it stale until the next boot.
 *
 * The two controls hang off the circle's corners rather than sitting in a row
 * beneath it, so it is the photo that is obviously being edited and not the
 * page. Remove is only mounted when there is a photo: a control that does
 * nothing is worse than an absent one.
 */
const AvatarField: React.FC = () => {
  const { user, setUser } = useAuthStore()
  const [picking, setPicking] = useState(false)
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const [busy, setBusy] = useState(false)

  const upload = async (file: File) => {
    setBusy(true)
    try {
      // Resized here to about 20KB, which also applies the EXIF rotation a
      // phone records instead of rotating the pixels. The server re-encodes
      // regardless; this is for the upload, not for safety.
      const blob = await resizeImage(file)
      setUser(await uploadAvatar(blob))
      setPicking(false)
      toast.success("Photo updated")
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not update your photo", componentName: "AvatarField" })
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      setUser(await deleteAvatar())
      setConfirmingRemove(false)
      toast.success("Photo removed")
    } catch (error: unknown) {
      handleError({ error, userMessage: "Could not remove your photo", componentName: "AvatarField" })
    } finally {
      setBusy(false)
    }
  }

  const controls = (
    <>
      {/* ring-bg cuts a gap between the button and the photo behind it, which
          is what keeps a dark icon legible over a dark corner of a picture. */}
      <MotionButton
        size="square"
        className="ring-bg absolute right-0 bottom-0 rounded-full ring-2"
        onClick={() => setPicking(true)}
        disabled={busy}
        ariaLabel="Change your profile photo"
        title="Change your profile photo"
        icon={<PencilIcon className="h-4 w-4" />}
      >
        {/* children is required by MotionButtonProps; {null} satisfies it
            without rendering anything, as in ShareListButton. */}
        {null}
      </MotionButton>

      {user?.avatar && (
        <MotionButton
          size="square"
          variant="error"
          className="ring-bg absolute bottom-0 left-0 rounded-full ring-2"
          onClick={() => setConfirmingRemove(true)}
          disabled={busy}
          ariaLabel="Remove your profile photo"
          title="Remove your profile photo"
          icon={<TrashIcon className="h-4 w-4" />}
        >
          {null}
        </MotionButton>
      )}
    </>
  )

  return (
    <>
      <Avatar image={user?.avatar} username={user?.username} email={user?.email} size="lg" overlay={controls} />

      <AvatarUploadModal isOpen={picking} onClose={() => setPicking(false)} onSelect={upload} busy={busy} />

      {/* A dialog rather than a bare button, for the same reason removing a game
          gets one: the click is one pixel from the button that opens the picker,
          and the photo is not recoverable from here. */}
      <Modal isOpen={confirmingRemove} onClose={() => setConfirmingRemove(false)} size="xs">
        <div className="flex w-full flex-col gap-6 p-6">
          <p className="text-center">Remove your profile photo? Your name will show a plain placeholder instead.</p>
          <div className="flex w-full gap-2">
            <MotionButton variant="error" flex onClick={remove} disabled={busy}>
              Really remove
            </MotionButton>
            <MotionButton flex onClick={() => setConfirmingRemove(false)} disabled={busy}>
              Close
            </MotionButton>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AvatarField
